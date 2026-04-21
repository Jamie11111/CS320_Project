import { View, Text, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, Image } from "react-native"
import { useRouter } from "expo-router"
import samplepfp from "../assets/images/samplepfp.png"
import "../global.css"
import React from "react"
const ChatDetailScreen = () => {
  const router = useRouter()
  const otherUserPfp = null

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-400" 
    >
      
      <View >
       
        
        <Pressable 
          onPress={() => router.push("/profile-feed")}
          className="bg-umass-red py-3 br-rounded-2xl flex-row items-center justify-center"
        >
          <Pressable onPress={() => router.push("/chats")} className="absolute left-4">
            <Text className="text-white font-bold text-xl">{"<"}</Text>
        </Pressable>
          <Image 
            source={otherUserPfp ? { uri: otherUserPfp } : samplepfp} 
            className="w-10 h-10 rounded-full bg-gray-200 shadow-sm mr-3" 
          />
          <Text className="text-2xl text-white">John Doe</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        
        <View className="bg-white rounded-2xl p-3 flex-row items-center mb-6 w-3/4">
          <View className="w-16 h-16 bg-gray-200 rounded-xl shadow-sm mr-4" />
          <View>
            <Text className="text-xl font-bold">Product</Text>
            <Text className="text-lg text-gray-700">Location</Text>
          </View>
        </View>

        <View className="items-end mb-4">
          <View 
            style={{ borderBottomRightRadius: 4 }}
            className="bg-umass-red px-5 py-3 rounded-[20px] "
          >
            <Text className="text-white font-bold text-xl">I offer $10</Text>
          </View>
          <Text className="text-black text-sm mt-1 mr-1">9:41 AM</Text>
        </View>

        <View className="items-start mb-4">
          <View 
            style={{ borderBottomLeftRadius: 4 }}
            className="bg-gray-600 px-5 py-3 rounded-[20px]"
          >
            <Text className="text-white font-bold text-xl">I counter $15</Text>
          </View>
          <Text className="text-black text-sm mt-1 ml-1">9:42 AM</Text>
        </View>

        
        <View className="items-end mb-4">
          <View 
            style={{ borderBottomRightRadius: 4 }}
            className="bg-umass-red px-5 py-3 rounded-[20px] "
          >
            <Text className="text-white font-bold text-xl">Deal!</Text>
          </View>
          <Text className="text-black text-sm mt-1 mr-1">9:45 AM</Text>
        </View>

     
        <View className="items-start mb-4">
          <View 
            style={{ borderBottomLeftRadius: 4 }}
            className="bg-gray-600 px-5 py-3 rounded-[20px] "
          >
            <Text className="text-white font-bold text-xl">Sounds good!</Text>
          </View>
          <Text className="text-black text-sm mt-1 ml-1">9:46 AM</Text>
        </View>
      </ScrollView>

      <View className="bg-umass-red p-6 flex-row items-center bottom-[-40]">
        <View className="flex-1 bg-white h-14 rounded-full flex-row items-center px-4 mr-2 mb-2">
          <TextInput 
            placeholder="Message" 
            placeholderTextColor="#999"
            className="flex-1 h-full text-xl" 
          />
          <Pressable className="bg-gray-600 w-10 h-10 rounded-full items-center justify-center">
            <Text className="text-white text-3xl mb-1">+</Text>
          </Pressable>
        </View>
        
        <Pressable className="bg-gray-300 px-6 h-14 rounded-[20px] items-center justify-center">
          <Text className="text-black text-xl">Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

export default ChatDetailScreen