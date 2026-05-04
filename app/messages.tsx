import { View, Text, ScrollView, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, Image } from "react-native"
import { useRouter } from "expo-router"
import samplepfp from "../assets/images/samplepfp.png"
import "../global.css"
import React from "react"
import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { fetchFromBackend } from "../scripts/authFetch"

const ChatDetailScreen = () => {
  
  const router = useRouter()
  const otherUserPfp = null

  type ChatMessage = {
    message_id: string
    message: string
    sent_at: string
    chat_id: string
    sender_id: string

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
    let alive = true;


    

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

      const historyData = await historyRes.json();
      setMessages(Array.isArray(historyData) ? historyData : []);

      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      if (!accessToken || !refreshToken) {
        console.error("Missing tokens for WebSocket connection");
        return;
      }

      const ws = new WebSocket(`ws://localhost:3000/api/chat/ws?chat_id=${cid}&token=${accessToken}&refresh_token=${refreshToken}`);
      wsRef.current = ws;
      ws.onopen = () => {
          
        console.log("WebSocket connection opened");
      };

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

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
      };
    }

    init();



    return () => {
      alive = false;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [chatId]);

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


  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-400" 
    >
      
      <View >
      
        <View 
          className="bg-umass-red py-3 br-rounded-2xl flex-row items-center justify-center"
        >
        <Pressable onPress={() => router.push("/chats")} className="absolute left-4">
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
        return (
          <View key={item.message_id} className={`mb-4 ${isSentByCurrentUser ? "items-end" : "items-start"}`}>
            <View 
                style={{ borderBottomLeftRadius: isSentByCurrentUser ? 20 : 4, borderBottomRightRadius: isSentByCurrentUser ? 4 : 20 }}
                className={`${isSentByCurrentUser ? "bg-umass-red" : "bg-gray-600"} px-5 py-3 rounded-[20px] `}
              >
                <Text className="text-white font-bold text-xl">{item.message}</Text>
              </View>
              <Text className={`text-black text-sm mt-1 ${isSentByCurrentUser ? "mr-1" : "ml-1"}`}>
                {new Date(item.sent_at + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
          </View>
        
          )
        }      } />


      <View className="bg-umass-red p-6 flex-row items-center bottom-[-40]">
        <View className="flex-1 bg-white h-14 rounded-full flex-row items-center px-4 mr-2 mb-2">
          <TextInput 
            placeholder="Message" 
            placeholderTextColor="#999"
            className="flex-1 h-full text-xl" 
            value={draft}
            onChangeText={setDraft}
          />
          <Pressable className="bg-gray-600 w-10 h-10 rounded-full items-center justify-center">
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