import "../global.css"
import { View, Text, Pressable } from "react-native"
import { useRouter } from "expo-router"
const Navbar = () => {
  const router = useRouter()
  return (
    
    <View className="w-full h-16 bg-umass-red flex-row items-center justify-between px-4">
        <Pressable onPress={() => router.push("/")} className="flex-row items-center">
          <Text className="text-white text-lg font-bold">UMarket</Text>
        </Pressable>
        <View className="bg-white/50 w-[65%] h-8 rounded-lg "></View>
        <View className="bg-white w-9 h-9 shadow-sm rounded-full"></View>
    </View>
  )
}

export default Navbar