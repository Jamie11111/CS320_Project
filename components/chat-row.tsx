import { View, Text, Image } from "react-native"
import "../global.css"
import React from "react"
import samplepfp from "../assets/images/samplepfp.png"
interface ChatRowProps {
  name: string
  lastMessage: string
  time: string
  isUnread?: boolean
  pfpUrl?: string | null
}

const ChatRow = ({ name, lastMessage, time, isUnread, pfpUrl }: ChatRowProps) => {
  return (
    <View className="flex-row items-center px-6 py-4 border-b border-gray-100 bg-white">

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
           {name}
         </Text>
         <Text className={`${isUnread ? "text-red-500 font-bold" : "text-gray-500 font-medium"}`}>
           {time}
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
    </View>
  )
}

export default ChatRow