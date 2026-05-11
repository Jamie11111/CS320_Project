import "../global.css"
import { View, Text, Pressable, Image } from "react-native"
import { useRouter } from "expo-router"
import samplepfp from "../assets/images/samplepfp.png"
import React from "react"
interface ProfileFeedBannerProps {
    authorName: string
    authorLocation: string
    authorPfp?: string | null
}

const ProfileFeedBanner = ({ authorName, authorLocation, authorPfp }: ProfileFeedBannerProps) => {
  {/*Displays only city, state */}
  const formatLocation = (loc: string) => {
    if (!loc) return "Location not available";
    const parts = loc.split(',');
    // console.log("Parts:", parts);
    if (parts.length >= 5) {
      return `${parts[parts.length - 5].trim()}, ${parts[parts.length - 3].trim()}`;
    }
    if (parts.length >= 2) {
      return `${parts[parts.length - 2].trim()}, ${parts[parts.length - 1].trim()}`;
    }
    return loc;
  };

  const displayLocation = formatLocation(authorLocation);
  return (
    <View className="px-4 pt-4 pb-3 bg-white border-b border-gray-200 flex-row justify-around items-center sticky">
      <Image source={authorPfp ? { uri: authorPfp } : samplepfp} className={`bg-gray-200 w-28 h-28 rounded-full ml-2`}></Image>
      <View>
          <Text className="text-xl font-bold">{authorName}</Text>
          <Text className="text-lg font-medium">{displayLocation}</Text>
      </View>
    </View>
  )
}
export default ProfileFeedBanner