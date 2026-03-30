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
    <View>

      <View className="px-4 pt-4 pb-3 bg-white flex-row">
        <View>
          <View className="bg-gray-200 shadow-sm w-28 h-28 rounded-full ml-2" />
          <Pressable className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2">
            <Text className="text-white text-xs font-bold">Edit</Text>
          </Pressable>
        </View>
        <View className="ml-5 mt-3 flex-1">
            <Text className="text-xl font-bold">Name: {name}</Text>
            <View className="flex-row">
              <Text className="text-lg font-medium">Email: {email}</Text>
            </View>
            <View className="flex-row">
              <Text className="text-lg font-medium mt-1">Location: </Text>
              <TextInput 
                className="bg-gray-300 rounded-lg w-[50%] p-2 overflow-y-scroll" 
                defaultValue={location}
                placeholder="Enter"
                maxLength={50}
              />
            </View>
        </View>
      </View>
    <Text className="text-black text-3xl font-bold m-4 mb-1">Your Products</Text>
    </View>
  )
}
export default MyProfileBanner