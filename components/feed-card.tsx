import "../global.css"
import { View, Text } from "react-native"

const FeedCard = () => {
  return (
    <View className="w-[172px] h-[200px] bg-gray-300 rounded-2xl shadow-md m-3 flex-col">
        <View className="bg-umass-red absolute bottom-0 w-full h-[25%] rounded-br-2xl rounded-bl-2xl flex-row flex-1 p-1">
            <View className="flex-1 ml-0.5">
                <Text className="text-lg font-bold text-white">Product Name</Text>
                <Text className="text-md text-white">Location</Text>
            </View>
            <View className="justify-center absolute right-0 top-[40%] mr-2">
                <Text className="text-sm text-white">Price</Text>
            </View>
        </View>
    </View>
  )
}

export default FeedCard