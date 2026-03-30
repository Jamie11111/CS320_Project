import "../global.css"
import { View, Text, ScrollView, Pressable, Image } from "react-native"
import { useRouter } from "expo-router"

type FeedImageSource = import("react-native").ImageSourcePropType | string

interface FeedCardExpandedProps {
  title: string
  location: string
  price: string
  description: string
  images?: FeedImageSource[]
  onClose: () => void
}

const FeedCardExpanded = ({ title, location, price, description, images = [], onClose }: FeedCardExpandedProps) => {
  const router = useRouter()
  const displayImages = images.slice(0, 5)

  return (
  <View className="flex-1 pt-16">
    <View className="flex-1 w-full bg-white overflow-hidden">
    
    <View className="items-center mt-4 mb-2">
      <ScrollView
      horizontal={true}
      className="max-h-96"
      contentContainerStyle={{ paddingHorizontal: 16, alignItems: "center" }}
      showsHorizontalScrollIndicator={false}
      >
      {displayImages.map((image, index) => (
        <Image
          key={index}
          source={typeof image === "string" ? { uri: image } : image}
          className="rounded-lg w-96 h-96 mr-2"
        />
      ))}
      <Text> </Text>
      </ScrollView>
    </View>

    <View className="p-4">
      <View className="flex-row items-start justify-between">
      <View className="flex-1 pr-3">
        <Text className="text-xl font-bold">{title}</Text>
        <Text className="text-lg font-medium">{location}</Text>
        <Text className="text-lg font-medium">{price}</Text>
      </View>
      <Pressable
        className="mb-4"
        onPress={() => {
        onClose()
        router.push("/profile-feed")
        }}
      >
        <View className="bg-gray-200 shadow-sm w-16 h-16 rounded-full ml-2" />
      </Pressable>
      </View>
      <ScrollView
      className="mt-2 h-64 mb-12" 
      showsVerticalScrollIndicator={true}
      contentContainerStyle={{ paddingBottom: 8 }}
      >
      <Text className={"text-lg text-gray-700"}>{description}</Text>
      </ScrollView>
    </View>
    <View className="flex-row justify-around">
      <Pressable onPress={onClose} className="mb-4 mt-auto w-52 bg-umass-red rounded-xl p-3 items-center">
      <Text className="text-white font-bold">Close</Text>
      </Pressable>
      <Pressable onPress={() => {
        onClose()
        router.push("/messages")
      }} className="mb-4 mt-auto w-52 bg-umass-red rounded-xl p-3 items-center">
        <Text className="text-white font-bold">Message this Seller</Text>
      </Pressable>
    </View>
    </View>
  </View>
  )
}

export default FeedCardExpanded