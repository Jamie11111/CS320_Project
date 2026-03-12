import "../global.css"
import { View, Text } from "react-native"

const Navbar = () => {
  return (
    <View className="w-full h-16 bg-umass-red flex-row items-center justify-between px-4">
        <Text className="text-white text-lg font-bold">UMarket</Text>
        <View className="bg-white/50 w-[60%] h-8 rounded-full"></View>
        <View className="bg-white w-9 h-9 rounded-full"></View>
    </View>
  )
}

export default Navbar