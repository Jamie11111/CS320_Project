import { View, Text, FlatList, TextInput, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { fetchWithAuth } from "../scripts/authFetch"
import "../global.css"
import ChatRow from "../components/chat-row"
import Navbar from "../components/navbar"
import React from "react"
const ChatListScreen = () => {
  type Chat = {
    chat_id: string
    seller_id: string
    customer_id: string
  }
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [chats, setChats] = useState<Chat[]>([])
  
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetchWithAuth('http://localhost:3000/api/user')
      if (res.ok) setCurrentUser(await res.json())
    }

    const fetchChats = async () => {
      try {
        const res = await fetchWithAuth('http://localhost:3000/api/chats')
        if (!res.ok) throw new Error("Failed to fetch chats")
        const data = await res.json()
        setChats(data)

      } catch (error) {
        console.error("Error fetching chats:", error)
      }
    }

    
    
    fetchChats()
    fetchUser()



  }, [])
  

  return (
    <View>
      <View className="h-[92%]">
        <FlatList
          data={chats}
          ListEmptyComponent={
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
              time={"2:30 PM"} 
              lastMessage={"Hey, is this still available?"} 
              pfpUrl={null}
              {...item}
              isUnread={index === 0}
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