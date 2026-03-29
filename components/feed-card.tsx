import "../global.css"
import { View, Text, Pressable, Modal } from "react-native"
import { useState } from "react"
import { useRouter } from "expo-router"
import FeedCardExpanded from "./feed-card-expanded"

type FeedImageSource = import("react-native").ImageSourcePropType | string

interface FeedCardProps {
  title?: string
  location?: string
  price?: string
  description?: string
  images?: FeedImageSource[]
  isEditing?: boolean
}

const FeedCard = ({
  title = "Product Name",
  location = "Location",
  price = "Price",
  description = "Description",
  images = [],
  isEditing = false,
}: FeedCardProps) => {
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()

  const handlePress = () => {
    if (isEditing) {
      router.push({
        pathname: "/upload-product",
        params: {
          isEditing: "true",
          initialName: title,
          initialPrice: price,
          initialLocation: location,
          initialDescription: description,
        },
      })
      return
    }

    setExpanded(true)
  }

  return (
    <>
      <Pressable className="w-[46%] h-[200px] bg-gray-300 rounded-lg shadow-sm m-2 flex-col" onPress={handlePress}>
        <View className="bg-umass-red absolute bottom-0 w-full h-[25%] rounded-br-lg rounded-bl-lg flex-row flex-grow flex-1 p-1">
            <View className="flex-1 ml-0.5">
                <Text className="text-lg font-bold text-white">{title}</Text>
                <Text className="text-md text-white">{location}</Text>
            </View>
            <View className="justify-center absolute right-0 top-[40%] mr-2">
                <Text className="text-sm text-white">{price}</Text>
            </View>
        </View>
      </Pressable>

      <Modal visible={expanded} transparent animationType="fade" onRequestClose={() => setExpanded(false)}>
        <FeedCardExpanded
          title={title}
          location={location}
          price={price}
          description={description}
          images={images}
          onClose={() => setExpanded(false)}
        />
      </Modal>
    </>
  )
}

export default FeedCard