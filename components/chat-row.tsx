import { View, Text } from "react-native"
import "../global.css"

interface ChatRowProps {
  name: string
  lastMessage: string
  time: string
}

const ChatRow = ({ name, lastMessage, time }: ChatRowProps) => {
  return (
    <View className="flex-row items-center px-6 py-4 border-b border-gray-100 bg-white">
      
      <View className="w-14 h-14 rounded-full bg-gray-300 shadow-sm mr-4" />

      
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-xl font-bold text-black">{name}</Text>
          <Text className="text-gray-500 font-medium">{time}</Text>
        </View>
        
        <Text 
          className="text-gray-600 text-lg leading-tight" 
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {lastMessage}
        </Text>
      </View>
    </View>
  )
}

export default ChatRow