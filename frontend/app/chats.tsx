import { View, Text, FlatList, TextInput, Pressable, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { useContext, useEffect, useState } from "react"
import { fetchFromBackend } from "../scripts/authFetch"
import "../global.css"
import ChatRow from "../components/chat-row"
import Navbar from "../components/navbar"
import React from "react"
import { DataContext } from "../components/data-context"
// nathan: I contributed to this page. Here's the link to my chat history: https://docs.google.com/document/d/1u9LGxUgeqAQaNWG-5akh0ubJIzHt86uWcvsi_7NozEk/edit?usp=sharing
// all my comments are human-written to demonstrate understanding.
const ChatListScreen = () => {
  type Chat = {
    chat_id: string
    seller_id: string
    customer_id: string
    sender_id: string
    message_id: string
    message: string
    sent_at: string
    is_unread: boolean
  }
  const router = useRouter()
  const {cachedData, updateCache} = useContext(DataContext);
  const { profileData } = cachedData;
  const [currentUser, setCurrentUserFn] = useState<any>(profileData);
  const lastMessageIdByChat = cachedData.lastMessageIdByChat || {};
  const isUnreadByChat = cachedData.isUnreadByChat || {};
  const setCurrentUser = (value: React.SetStateAction<any>) => {
    setCurrentUserFn(value);
    updateCache("profileData", value);
  }
  const [chats, setChats] = useState<Chat[]>([])
  const [loadingChats, setLoadingChats] = useState<boolean>(true);
  
  let timeoutLoop: NodeJS.Timeout | null = null;

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetchFromBackend('/api/user', {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })

      if (res.ok) setCurrentUser(await res.json())
    }

    const fetchChats = async () => {
      try {

        // nathan: fetch chats and update cache to check which chats have new messages (based on last message ID) 
        const res = await fetchFromBackend('/api/chats', {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })
        if (!res.ok) throw new Error("Failed to fetch chats")
        const data = await res.json()
        const newLastMessageIdByChat = { ...lastMessageIdByChat };
        const newIsUnreadByChat = { ...isUnreadByChat };
        data.forEach((chat: Chat) => {
          // nathan: if the sender of the last message is the current user, don't mark it as unread
          if (chat.sender_id === currentUser?.user_id) {
            newIsUnreadByChat[chat.chat_id] = false;
            newLastMessageIdByChat[chat.chat_id] = chat.message_id;
            return;
          }

          // nathan: otherwise, if the last message ID is different, mark it as unread
          if (chat.message_id != lastMessageIdByChat[chat.chat_id]) {
            console.log("New message in chat " + chat.chat_id);
            console.log("Old last message id: " + lastMessageIdByChat[chat.chat_id]);
            newLastMessageIdByChat[chat.chat_id] = chat.message_id;
            newIsUnreadByChat[chat.chat_id] = true;
          }
          // nathan: if they are the same, keep the chat marked as unread 
          else {
            newIsUnreadByChat[chat.chat_id] = false;
          }
        })

        // nathan: update cache dictionaries: each chat (key) maps to the last message ID and whether it's unread 
        updateCache("lastMessageIdByChat", newLastMessageIdByChat);
        updateCache("isUnreadByChat", newIsUnreadByChat);
        setChats(data)
        

      } catch (error) {
        console.error("Error fetching chats:", error)
      } finally {
        setLoadingChats(false);
      }
    }

    
    // nathan: fetch chats every 5 seconds
    fetchChats();
    if (timeoutLoop === null){
      timeoutLoop = setInterval(() => {
        fetchChats()

      }, 5000) 
    }
    fetchUser()

    return () => { if(timeoutLoop) clearInterval(timeoutLoop); timeoutLoop = null; }

  }, [])

  return (
    <View>
      <View className="h-[92%]">
        <FlatList
          data={chats}
          ListEmptyComponent={ loadingChats ? <ActivityIndicator size="large" /> :
            <View className="items-center justify-center pt-32 px-10">
              <Text className="text-6xl mb-4 text-center">💬</Text>
              <Text className="text-gray-500 text-xl font-bold text-center">No chats yet!</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <Pressable onPress={() => {
              updateCache("isUnreadByChat", { ...cachedData.isUnreadByChat, [item.chat_id]: false });
            }}>
              <ChatRow 
                sellerId={item.seller_id === currentUser?.user_id ? item.customer_id : item.seller_id}
                chatId={item.chat_id}
                lastMessageTime={`${new Date(item.sent_at + 'Z').toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' })} ${new Date(item.sent_at + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} 
                lastMessage={item.message} 
                pfpUrl={null}
                {...item}
                isUnread={isUnreadByChat[item.chat_id] || false}
              />
            </Pressable>

          )}
          keyExtractor={(_, i) => i.toString()}
        />

      </View>
      <Navbar userPfp={currentUser?.profile_picture_url || null}/>
        {/* <View className="bg-white rounded-full flex-row items-center px-4 h-10 border-2 border-black">
          <TextInput placeholder="Search Messages" className="flex-1 font-bold" />
        </View> */}

    </View>
  )
}

export default ChatListScreen