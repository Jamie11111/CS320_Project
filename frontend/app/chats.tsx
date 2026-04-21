import { View, Text, FlatList, TextInput, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { fetchWithAuth } from "../scripts/authFetch"
import "../global.css"
import ChatRow from "../components/chat-row"
import Navbar from "../components/navbar"
import React from "react"

const ChatListScreen = () => {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetchWithAuth('http://localhost:3000/api/user')
      if (res.ok) setCurrentUser(await res.json())
    }
    fetchUser()
  }, [])
  
  const chats = Array(8).fill({ 
    name: "John Doe", 
    lastMessage: "Is this still available?", 
    time: "2m ago" ,
    pfpUrl: null
  })

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
            <Pressable onPress={() => router.push("/messages")}>
            <ChatRow
              {...item}
              isUnread={index === 0}
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