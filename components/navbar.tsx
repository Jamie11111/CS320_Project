import "../global.css"
import { View, Text } from "react-native"

const Navbar = () => {
  return (
    <View className="w-full h-16 bg-umass-red flex-row items-center justify-between px-4">
        <Text className="text-white text-lg font-bold">UMarket</Text>
        <Text className="text-gray-300">Home</Text>
        <Text className="text-gray-300">Products</Text>
        <Text className="text-gray-300">Cart</Text>
        <Text className="text-gray-300">Profile</Text>
    </View>
  )
}

export default Navbar