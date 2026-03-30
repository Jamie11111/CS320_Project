import "../global.css"
import { View, Text, Pressable, TextInput} from "react-native"
import { useRouter } from "expo-router"
const Navbar = () => {
  const router = useRouter()
  return (
    
    <View className="w-full h-16 bg-umass-red flex-row items-center justify-between px-4">
        <Pressable onPress={() => router.push("/")} className="flex-row items-center">
          <Text className="text-white text-lg font-bold">UMarket</Text>
        </Pressable>
        <TextInput className="bg-white/50 w-[65%] h-8 rounded-lg "></TextInput>
        <Pressable onPress={() => router.push("/my-profile")} className="flex-row items-center">
          <View className="bg-gray-200 w-9 h-9 shadow-sm rounded-full"></View>
        </Pressable>
    </View>
  )
}

export default Navbar