import { View, Text, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native"
import { useRouter } from "expo-router"
import "../global.css"

const ChatDetailScreen = () => {
  const router = useRouter()

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-400" 
    >
      
      <View className="bg-umass-red pt-12 pb-4 px-4 rounded-b-[20px]">
        <Pressable onPress={() => router.push("/chats")} className="flex-row items-center mb-4">
          <Text className="text-white font-bold text-xl">{"< Back to chats"}</Text>
        </Pressable>
        
        <Pressable 
          onPress={() => router.push("/profile-feed")}
          className="bg-white py-3 rounded-2xl flex-row items-center justify-center border-2 border-black"
        >
          <View className="w-10 h-10 rounded-full border-2 border-black mr-3" />
          <Text className="text-2xl font-bold">John Doe</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        
        <View className="bg-white rounded-2xl p-3 flex-row items-center border-2 border-black mb-6 w-3/4">
          <View className="w-16 h-16 bg-gray-200 rounded-xl border border-black mr-4" />
          <View>
            <Text className="text-xl font-black">Product</Text>
            <Text className="text-lg text-gray-700">Location</Text>
          </View>
        </View>

        <View className="items-end mb-4">
          <View 
            style={{ borderBottomRightRadius: 4 }}
            className="bg-umass-red px-5 py-3 rounded-[20px] border border-black"
          >
            <Text className="text-white font-bold text-xl">I offer $10</Text>
          </View>
          <Text className="text-black text-sm mt-1 mr-1">9:41 AM</Text>
        </View>

        <View className="items-start mb-4">
          <View 
            style={{ borderBottomLeftRadius: 4 }}
            className="bg-gray-600 px-5 py-3 rounded-[20px] border border-black"
          >
            <Text className="text-white font-bold text-xl">I counter $15</Text>
          </View>
          <Text className="text-black text-sm mt-1 ml-1">9:42 AM</Text>
        </View>

        
        <View className="items-end mb-4">
          <View 
            style={{ borderBottomRightRadius: 4 }}
            className="bg-umass-red px-5 py-3 rounded-[20px] border border-black"
          >
            <Text className="text-white font-bold text-xl">Deal!</Text>
          </View>
          <Text className="text-black text-sm mt-1 mr-1">9:45 AM</Text>
        </View>

     
        <View className="items-start mb-4">
          <View 
            style={{ borderBottomLeftRadius: 4 }}
            className="bg-gray-600 px-5 py-3 rounded-[20px] border border-black"
          >
            <Text className="text-white font-bold text-xl">Sounds good!</Text>
          </View>
          <Text className="text-black text-sm mt-1 ml-1">9:46 AM</Text>
        </View>
      </ScrollView>

   
      <View className="bg-umass-red p-4 pb-8 flex-row items-center rounded-t-[20px] border-t-2 border-black">
        <View className="flex-1 bg-white h-14 rounded-full flex-row items-center px-4 border-2 border-black mr-2">
          <TextInput 
            placeholder="Message" 
            placeholderTextColor="#999"
            className="flex-1 h-full text-xl font-bold" 
          />
          <Pressable className="bg-gray-600 w-10 h-10 rounded-full items-center justify-center border border-black">
            <Text className="text-white text-3xl font-bold mb-1">+</Text>
          </Pressable>
        </View>
        
        <Pressable className="bg-gray-300 px-6 h-14 rounded-[20px] items-center justify-center border-2 border-black">
          <Text className="text-black font-black text-xl">Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

export default ChatDetailScreen