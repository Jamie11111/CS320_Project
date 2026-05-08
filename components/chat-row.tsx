import { View, Text, Image, Pressable } from "react-native"
import "../global.css"
import React, { useEffect } from "react"
import samplepfp from "../assets/images/samplepfp.png"
import { useRouter } from "expo-router"
import { fetchFromBackend } from "../scripts/authFetch"
interface ChatRowProps {
  sellerId: string
  chatId: string
  lastMessage: string
  lastMessageTime: string
  isUnread?: boolean
  pfpUrl?: string | null
}

const ChatRow = ({ sellerId, chatId, lastMessage, lastMessageTime, isUnread, pfpUrl }: ChatRowProps) => {
  const [sellerName, setName] = React.useState("")
  const router = useRouter()
  useEffect(() => {
    const fetchSellerName = async () => {
      try {
        const response = await fetchFromBackend(`/api/user/${sellerId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })
        if (!response.ok) {
          throw new Error("Failed to fetch seller name")
        }
        const data = await response.json()
        setName(data.name)
      } catch (error) {
        console.error("Error fetching seller name:", error)
      }
      
    }
    
    fetchSellerName()
  }, [sellerId])
  return (
    <Pressable onPress={() => router.push({ pathname: "/messages", params: { chatId: chatId, sellerName: sellerName } })} className="flex-row items-center px-6 py-4 border-b border-gray-100 bg-white">

      <View className="w-4 items-center justify-center mr-2">
       {isUnread && (
         <View className="w-3 h-3 rounded-full bg-red-500" />
       )}
     </View>

      
      <Image 
        source={pfpUrl ? { uri: pfpUrl } : samplepfp} 
        className="w-14 h-14 rounded-full bg-gray-300 shadow-sm mr-4" 
      />

      
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <Text className={`text-xl ${isUnread ? "font-black" : "font-bold"} text-black`}>
           {sellerName}
         </Text>
         <Text className={`${isUnread ? "text-red-500 font-bold" : "text-gray-500 font-medium"}`}>
           {lastMessageTime}
         </Text>
        </View>
        
        <Text 
          className={`${isUnread ? "text-black font-semibold" : "text-gray-500"} text-lg leading-tight`}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {lastMessage}
        </Text>
      </View>

      <Text className="text-gray-300 ml-2 text-xl font-light">{">"}</Text>
    </Pressable>
  )
}

export default ChatRow