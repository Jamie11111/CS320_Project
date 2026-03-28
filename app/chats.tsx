import { View, Text, FlatList, TextInput, Pressable } from "react-native"
import { useRouter } from "expo-router"
import "../global.css"
import ChatRow from "../components/chat-row"

const ChatListScreen = () => {
  const router = useRouter()
  
  const chats = Array(8).fill({ 
    name: "John Doe", 
    lastMessage: "Is this still available?", 
    time: "2m ago" 
  })

  return (
    <View className="flex-1 bg-white">
      <View className="bg-umass-red pt-12 pb-6 px-4 rounded-b-[27px]">
        <Pressable onPress={() => router.push("/")} className="mb-4">
          <Text className="text-white font-bold text-xl">{"< Back to Main Feed"}</Text>
        </Pressable>

        <View className="bg-white rounded-full flex-row items-center px-4 h-10 border-2 border-black">
          <TextInput placeholder="Search Messages" className="flex-1 font-bold" />
        </View>
      </View>

      <Text className="text-4xl font-bold px-6 py-4">Your Chats</Text>

      <FlatList
        data={chats}
        ListEmptyComponent={
          <View className="items-center justify-center pt-32 px-10">
            <Text className="text-6xl mb-4 text-center">💬</Text>
            <Text className="text-gray-500 text-xl font-bold text-center">No chats yet!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push("/messages")}>
            <ChatRow {...item} />
          </Pressable>
        )}
        keyExtractor={(_, i) => i.toString()}
      />
    </View>
  )
}

export default ChatListScreen