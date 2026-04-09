import "../global.css"
import { View, Text, Pressable, TextInput, Image, Alert} from "react-native"
import { useRouter, usePathname } from "expo-router"
import chatBubbleIcon from "../assets/images/chat_bubble.png"
import Logo from "../assets/images/Logo.png"
import React from "react"
import { useEffect } from "react"

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
  
  const currentPath = usePathname()
  useEffect(() => {
    console.log("Current path:", currentPath);
  }, [currentPath]);
  return (
    
    <View className="w-full h-24 bg-umass-red  px-6">
      <View className="flex-row items-center justify-between mt-3">
        <Pressable onPress={() => handleNavAttempt("/")} className={`flex-row items-center justify-around w-12 h-12 rounded-lg ${currentPath === "/" ? "shadow-xl -translate-y-1" :"shadow-sm"}`}>
          <Image source={Logo} className={`w-10 h-12`} />
        </Pressable>
        <TextInput className="bg-white/50 w-[60%] h-10 rounded-lg "></TextInput>
        <View className="flex-row items-center">

          <Pressable onPress={() => router.push("/my-profile")} className={`${currentPath === "/my-profile" ? "shadow-xl -translate-y-1" : "shadow-sm"}`}>
            <View className={`bg-gray-200 w-10 h-10 rounded-full`}></View>
          </Pressable>
          <Pressable
            onPress={(e) => {
              e.stopPropagation()
              handleNavAttempt("/chats")
            }}
            className={`px-2 py-1 ${currentPath === "/chats" ? "shadow-xl -translate-y-1" : "shadow-sm"}`}
          >
            <Image
              source={chatBubbleIcon}
              className={`w-11 h-11`}
              style={{ tintColor: "#fff" }}
            />
          </Pressable>
        </View>

      </View> 
    </View>
  )
}

export default Navbar