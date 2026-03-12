import "../global.css"
import { View, Text, Pressable, ScrollView } from "react-native"

interface FeedCardExpandedProps {
    title: string
    location: string
    price: string
    description: string
    onClose: () => void
}

const FeedCardExpanded = ({ title, location, price, description, onClose }: FeedCardExpandedProps) => {
  return (
    <View className="flex-1 bg-black/50 justify-center items-center">
      <View className="w-[85%] bg-white rounded-2xl shadow-lg overflow-hidden">
        <ScrollView horizontal={true}>
            {[1, 2, 3, 4, 5].map((item) => (
                <View key={item} className="w-96 h-96 bg-umass-red mr-2" />
            ))}
            <Text> </Text>
        </ScrollView>

        <View className="p-4">
          <Text className="text-xl font-bold">{title}</Text>
          <Text className="text-sm text-gray-500 mt-1">{location}</Text>
          <Text className="text-lg font-semibold text-umass-red mt-2">{price}</Text>
          <Text className="text-sm text-gray-700 mt-2">{description}</Text>
        </View>

        <Pressable onPress={onClose} className="m-4 bg-umass-red rounded-xl p-3 items-center">
          <Text className="text-white font-bold">Close</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default FeedCardExpanded