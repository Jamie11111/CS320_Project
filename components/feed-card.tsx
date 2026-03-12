import "../global.css"
import { View, Text, Pressable, Modal } from "react-native"
import { useState } from "react"
import FeedCardExpanded from "./feed-card-expanded"

interface FeedCardProps {
  title?: string
  location?: string
  price?: string
  description?: string
}
// destructuring the feed card props with default values for title, location, price, and description instead of using FeedCard - (props: FeedCardProps) and then internally 
// specifying props.title, props.location, etc, making for more concise code
const FeedCard = ({ title = "Product Name", location = "Location", price = "Price", description = "Description" }: FeedCardProps) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <Pressable className="w-[44%] h-[200px] bg-gray-300 rounded-2xl shadow-md m-3 flex-col" onPress={() => setExpanded(true)}>
        <View className="bg-umass-red absolute bottom-0 w-full h-[25%] rounded-br-2xl rounded-bl-2xl flex-row flex-1 p-1">
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
          onClose={() => setExpanded(false)}
        />
      </Modal>
    </>
  )
}

export default FeedCard