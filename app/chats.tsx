import { View, Text, FlatList, TextInput, Pressable, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { fetchFromBackend } from "../scripts/authFetch"
import "../global.css"
import ChatRow from "../components/chat-row"
import Navbar from "../components/navbar"
import React from "react"
const ChatListScreen = () => {
  type Chat = {
    chat_id: string
    seller_id: string
    customer_id: string
    message: string
    sent_at: string
    is_unread: boolean
  }
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
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
        const res = await fetchFromBackend('/api/chats', {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })
        if (!res.ok) throw new Error("Failed to fetch chats")
        const data = await res.json()

        setChats(data)
        chats.forEach((chat) => {
          console.log("Chat ID:", chat.chat_id)
          console.log("Seller ID:", chat.seller_id)
          console.log("Customer ID:", chat.customer_id)
          console.log("Last Message:", chat.message)
          console.log("Last Message Time:", chat.sent_at)
          console.log("Is Unread:", chat.is_unread)
        })

      } catch (error) {
        console.error("Error fetching chats:", error)
      } finally {
        setLoadingChats(false);
      }
    }

    fetchChats();
    if (timeoutLoop === null){
      timeoutLoop = setInterval(() => {
        fetchChats()
      }, 5000) // Poll every 5 seconds
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
            // <Pressable onPress={() => router.push({ pathname: "/messages", params: { chatId: item.chat_id } })}>
            <ChatRow 
              sellerId={item.seller_id === currentUser?.user_id ? item.customer_id : item.seller_id}
              chatId={item.chat_id}
              lastMessageTime={new Date(item.sent_at + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
              lastMessage={item.message} 
              pfpUrl={null}
              {...item}
              isUnread={item.is_unread}
            />
          // </Pressable>

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