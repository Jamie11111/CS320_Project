import "../global.css"
import { View, Text, Pressable, TextInput, Image, Alert} from "react-native"
import { useRouter } from "expo-router"
import chatBubbleIcon from "../assets/images/chat_bubble.png"
import Logo from "../assets/images/Logo.png"

interface NavbarProps {
  canNavigate?: boolean
}

const Navbar = ({ canNavigate = true }: NavbarProps) => {
  const router = useRouter()
  const handleNavAttempt = (path: string) => {
    if (!canNavigate) {
      Alert.alert(
        "Location Required",
        "Please set your location in your profile before leaving this page."
      )
    } else {
      router.push(path)
    }
  }
  return (
    
    <View className="w-full h-16 bg-umass-red flex-row items-center justify-between px-4">
        <Pressable onPress={() => handleNavAttempt("/")} className="flex-row items-center">
          <Image source={Logo} className="w-10 h-12 shadow-sm" />
        </Pressable>
        <TextInput className="bg-white/50 w-[60%] h-8 rounded-lg "></TextInput>
        <Pressable onPress={() => router.push("/my-profile")} className="flex-row items-center">
          <View className="bg-gray-200 w-9 h-9 shadow-sm rounded-full"></View>
        <Pressable
          onPress={(e) => {
            e.stopPropagation()
            handleNavAttempt("/chats")
          }}
          className="px-2 py-1"
        >
          <Image
            source={chatBubbleIcon}
            className="w-10 h-10 shadow-sm"
            style={{ tintColor: "#fff" }}
          />
        </Pressable>
        </Pressable>
    </View>
  )
}

export default Navbar