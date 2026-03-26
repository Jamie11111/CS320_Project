import "../global.css"
import { View, Text, Pressable , TextInput} from "react-native"
import { useRouter } from "expo-router"

interface MyProfileBannerProps {
    name: string
    location: string
    email:string 
}

const MyProfileBanner = ({ name, location, email }: MyProfileBannerProps) => {
  return (
    <View className="px-4 pt-4 pb-3 bg-white border-b border-gray-200 flex-row justify-around items-center sticky">
      <View className="relative">
        <View className="bg-white shadow-sm w-28 h-28 rounded-full ml-2" />
        <Pressable className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2">
          <Text className="text-white text-xs font-bold">Edit</Text>
        </Pressable>
      </View>
      <View>
          <Text className="text-xl font-bold">Name: {name}</Text>
          <Text className="text-lg font-medium">Location: {location}</Text>
          <View className="flex-row">
            <Text className="text-lg font-medium">Email: {email}</Text>
          </View>
      </View>
    </View>
  )
}
export default MyProfileBanner