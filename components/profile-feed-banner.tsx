import "../global.css"
import { View, Text, Pressable, Image } from "react-native"
import { useRouter } from "expo-router"
import samplepfp from "../assets/images/samplepfp.png"
import React from "react"
interface ProfileFeedBannerProps {
    authorName: string
    authorLocation: string
}

const ProfileFeedBanner = ({ authorName, authorLocation }: ProfileFeedBannerProps) => {
  return (
    <View className="px-4 pt-4 pb-3 bg-white border-b border-gray-200 flex-row justify-around items-center sticky">
      <Image source={samplepfp} className={`bg-gray-200 w-28 h-28 rounded-full ml-2`}></Image>
      <View>
          <Text className="text-xl font-bold">{authorName}</Text>
          <Text className="text-lg font-medium">{authorLocation}</Text>
      </View>
    </View>
  )
}
export default ProfileFeedBanner