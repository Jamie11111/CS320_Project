import { View, Text, ScrollView, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, Image, StyleSheet, Alert } from "react-native"
import { useRouter } from "expo-router"
import samplepfp from "../assets/images/samplepfp.png"
import "../global.css"
import React from "react"
import { useEffect, useRef, useState, useContext } from "react";
import { useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import { fetchFromBackend } from "../scripts/authFetch";
import { DataContext } from "../components/data-context"
// nathan: I worked on this page. Here's the link to my chat history: https://docs.google.com/document/d/13YOiN9XWPuTklOacpOOBlbKOUQGUYepCArZZ600iG0M/edit?usp=sharing 
// all my comments are human-written to demonstrate understanding.
const LISTING_CARD_PREFIX = "LISTING_CARD:";

type ListingCard = {
  id: string
  name: string
  price: string
  condition: string
  imageUrl: string | null
}

function ListingCardBubble({ message }: { message: string }) {
  let card: ListingCard
  try {
    card = JSON.parse(message.slice(LISTING_CARD_PREFIX.length))
  } catch {
    return <Text style={{ color: "#111827" }}>{message}</Text>
  }
  return (
    <View style={cardStyles.wrapper}>
      <Text style={cardStyles.header}>I am messaging about this product</Text>
      <View style={cardStyles.container}>
        {card.imageUrl ? (
          <Image source={{ uri: card.imageUrl }} style={cardStyles.image} resizeMode="cover" />
        ) : (
          <View style={[cardStyles.image, { backgroundColor: "#d1d5db" }]} />
        )}
        <View style={cardStyles.bar}>
          <View style={{ flex: 1 }}>
            <Text style={cardStyles.name} numberOfLines={1}>{card.name}</Text>
            <Text style={cardStyles.condition} numberOfLines={1}>{card.condition}</Text>
          </View>
          <Text style={cardStyles.price}>{card.price}</Text>
        </View>
      </View>
    </View>
  )
}

const cardStyles = StyleSheet.create({
  wrapper: { width: 240 },
  header: { fontSize: 12, color: "#6b7280", marginBottom: 6, fontStyle: "italic", fontWeight: "600" },
  container: { width: 240, borderRadius: 12, overflow: "hidden", backgroundColor: "#d1d5db" },
  image: { width: "100%", height: 180 },
  bar: { backgroundColor: "#881C1C", paddingHorizontal: 10, paddingVertical: 8, flexDirection: "row", alignItems: "center" },
  name: { color: "white", fontWeight: "bold", fontSize: 14 },
  condition: { color: "#fecaca", fontSize: 12, marginTop: 1 },
  price: { color: "white", fontSize: 13, fontWeight: "600", marginLeft: 8 },
})



const ChatDetailScreen = () => {
  const router = useRouter()
  const otherUserPfp = null
  const {cachedData, updateCache} = useContext(DataContext);

  type Attachment = {
    attachment_url: string
  }


  type ChatMessage = {
    message_id: string
    message: string
    sent_at: string
    chat_id: string
    sender_id: string
    attachments?: Attachment[]
  }

  
  const {chatId} = useLocalSearchParams<{chatId?: string}>()
  let {sellerName} = useLocalSearchParams<{sellerName?: string}>()  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState("")
  const wsRef = useRef<WebSocket | null>(null)
  const [senderId, setSenderId] = useState<string | null>(null)
  const flatListRef = useRef<FlatList<ChatMessage>>(null)



  fetchFromBackend("/api/user", {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(res => res.json())
    .then(data => setSenderId(data.user_id))
    .catch(err => console.error("Failed to fetch user data:", err));

  useEffect(() => {
    async function init() {
      if (!chatId) {
        console.error("No chatId provided in search params");
        return;
      }
      const cid = parseInt(chatId, 10);
      if (isNaN(cid)) {
        console.error("Invalid chatId:", chatId);
        return;
      }

      // nathan: get messages based on chat ID
      const historyRes = await fetchFromBackend(`/api/chats/${cid}/messages`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!historyRes.ok) {
        console.error("Failed to fetch chat history:", historyRes.status);
        return;
      }

      // nathan: add messages to an array
      const historyData = await historyRes.json();
      setMessages(Array.isArray(historyData) ? historyData : []);

      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      if (!accessToken || !refreshToken) {
        console.error("Missing tokens for WebSocket connection");
        return;
      }

      // nathan: create a websocket connection using the chat ID and tokens 
      const ws = new WebSocket(`ws://localhost:3000/api/chat/ws?chat_id=${cid}&token=${accessToken}&refresh_token=${refreshToken}`);
      wsRef.current = ws;

      // nathan: check if connection is opened
      ws.onopen = () => {
          
        console.log("WebSocket connection opened");
      };


      // nathan: when a message is received, add it to messages array
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(String(event.data));
          if (msg && msg.message_id) {
            setMessages(prev => [...prev, msg]);
          } else {
            console.warn("Received non-message data:", msg);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      // nathan: log when error occurs
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      // nathan: log when connection closes
      ws.onclose = () => {
        console.log("WebSocket connection closed");
      };
    }

    init();



    // nathan: cleanup 
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [chatId]);

  // nathan: function to send message 
  async function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not open. Cannot send message.");
      return;
    }
    ws.send(JSON.stringify({ message: text }));
    setDraft("");
  }

  async function pickAndUploadImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow photo library access to send images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const cid = chatId ? parseInt(chatId, 10) : NaN;
    if (isNaN(cid)) return;

    const filename = asset.fileName ?? `photo_${Date.now()}.jpg`;
    const mimeType = asset.mimeType ?? "image/jpeg";

    const form = new FormData();
    form.append("file", { uri: asset.uri, name: filename, type: mimeType } as any);

    const uploadRes = await fetchFromBackend(`/api/chats/${cid}/attachments`, {
      method: "POST",
      body: form as any,
    });

    if (!uploadRes.ok) {
      Alert.alert("Upload failed", "Could not send the image. Please try again.");
    }
  }


  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-400" 
    >
      
      <View >
      
        <View 
          className="bg-umass-red py-3 br-rounded-2xl flex-row items-center justify-center"
        >
        <Pressable onPress={() => {
          const latestMessage = messages[messages.length - 1];
          if (latestMessage) {
            // nathan: update cache to cache to mark message as read when going back to chats page
            updateCache("lastMessageIdByChat", { ...cachedData.lastMessageIdByChat, [chatId!]: latestMessage.message_id });
          }
          updateCache("isUnreadByChat", { ...cachedData.isUnreadByChat, [chatId!]: false });
        
          router.push("/chats")}} className="absolute left-4">
            <Text className="text-white font-bold text-xl">{"<"}</Text>
        </Pressable>
          <Image 
            source={otherUserPfp ? { uri: otherUserPfp } : samplepfp} 
            className="w-10 h-10 rounded-full bg-gray-200 shadow-sm mr-3" 
          />
          <Text className="text-2xl text-white">{sellerName || "Seller"}</Text>
        </View>
      </View>

      <FlatList data={messages} ref={flatListRef} onContentSizeChange={() => flatListRef.current?.scrollToEnd()} className="flex-1 px-4 pt-4" renderItem={({ item }) => {
        const isSentByCurrentUser = item.sender_id === senderId;
        const isCard = item.message?.startsWith(LISTING_CARD_PREFIX);
        return (
          <View key={item.message_id} className={`mb-4 ${isSentByCurrentUser ? "items-end" : "items-start"}`}>
            {isCard ? (
              <ListingCardBubble message={item.message} />
            ) : (
              <View
                style={{ borderBottomLeftRadius: isSentByCurrentUser ? 20 : 4, borderBottomRightRadius: isSentByCurrentUser ? 4 : 20 }}
                className={`${isSentByCurrentUser ? "bg-umass-red" : "bg-gray-600"} px-5 py-3 rounded-[20px]`}
              >
                {item.attachments?.map((att: Attachment, i: number) => (
                  <Image
                    key={i}
                    source={{ uri: att.attachment_url }}
                    style={{ width: 200, height: 200, borderRadius: 10, marginBottom: 4 }}
                    resizeMode="cover"
                    onLoad={() => flatListRef.current?.scrollToEnd() }
                  />
                ))}
                {item.message ? <Text className="text-white font-bold text-xl">{item.message}</Text> : null}
              </View>
            )}
            <Text className={`text-black text-sm mt-1 ${isSentByCurrentUser ? "mr-1" : "ml-1"}`}>
              {new Date(item.sent_at + 'Z').toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )
      }} />


      <View className="bg-umass-red p-6 flex-row items-center bottom-[-40]">
        <View className="flex-1 bg-white h-14 rounded-full flex-row items-center px-4 mr-2 mb-2">
          <TextInput 
            placeholder="Message" 
            placeholderTextColor="#999"
            className="flex-1 h-full text-xl" 
            value={draft}
            onChangeText={setDraft}
          />
          <Pressable onPress={pickAndUploadImage} className="bg-gray-600 w-10 h-10 rounded-full items-center justify-center">
            <Text className="text-white text-3xl mb-1">+</Text>
          </Pressable>
        </View>
        
        <Pressable onPress={sendMessage} className="bg-gray-300 px-6 h-14 rounded-[20px] items-center justify-center">
          <Text className="text-black text-xl">Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

export default ChatDetailScreen