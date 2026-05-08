import "../global.css"
import { View, Text, Pressable, TextInput, Image, Alert} from "react-native"
import { useRouter, usePathname } from "expo-router"
import chatBubbleIcon from "../assets/images/chat_bubble.png"
import Logo from "../assets/images/Logo.png"
import React from "react"
import { useEffect } from "react"
import samplepfp from "../assets/images/samplepfp.png"
interface NavbarProps {
  canNavigate?: boolean
  userPfp?: string | null; 
}

const Navbar = ({ canNavigate = true, userPfp }: NavbarProps) => {
 
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
        <Pressable onPress={() => handleNavAttempt("/main-feed")} className={`mt-2 flex-row items-center justify-around w-12 h-12 rounded-lg ${currentPath === "/" ? "shadow-xl -translate-y-1" :"shadow-sm"}`}>
          <Image source={Logo} className={`w-12 h-16`} />
        </Pressable>
        <Pressable
            onPress={() =>
              router.push({
                pathname: "/upload-product",
                params: { isEditing: "false" },
              })
            }
            className={'bg-white rounded-full px-5 py-3 ${currentPath === "/" ? "shadow-xl -translate-y-1" :"shadow-sm"} '}
          >
            <Text className="text-umass-red text-2xl font-bold">+</Text>
        </Pressable>
          <Pressable onPress={() => router.push("/my-profile")} className={`${currentPath === "/my-profile" ? "shadow-xl -translate-y-1" : "shadow-sm"}`}>
            <Image source={userPfp ? { uri: userPfp } : samplepfp} className={`bg-gray-200 w-14 h-14 rounded-full`}></Image>
          </Pressable>
          <Pressable
            onPress={(e) => {
              e.stopPropagation()
              handleNavAttempt("/chats")
            }}
            className={` ${currentPath === "/chats" ? "shadow-xl -translate-y-1" : "shadow-sm"}`}
          >
            <Image
              source={chatBubbleIcon}
              className={`w-14 h-14`}
              style={{ tintColor: "#fff" }}
            />
          </Pressable>

      </View> 
    </View>
  )
}

export default Navbar