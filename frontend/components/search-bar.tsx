import "../global.css"
import { View, Text, Pressable, TextInput, Image, Alert} from "react-native"
import { useRouter, usePathname } from "expo-router"
import chatBubbleIcon from "../assets/images/chat_bubble.png"
import Logo from "../assets/images/Logo.png"
import React, { useState } from "react"
import { useEffect } from "react"
import samplepfp from "../assets/images/samplepfp.png"
import search from "../assets/images/search.png"

const SearchBar = () => {
  const [clicked, setClicked] = useState(false)
  return (
    <View className="w-full h-12 flex items-center background-transparent">
        <Pressable onPress={()=> setClicked(true)} className={`bg-umass-red w-[80%] h-10 rounded-lg shadow-lg `}>
            {!clicked && <Image source={search} className={`${clicked ? "" : "w-6 h-6 absolute top-2 left-3"}`} />}
            <TextInput onPress={()=> setClicked(true)} className="h-10 pl-4"></TextInput>
        </Pressable>
    </View>
  )
}
export default SearchBar