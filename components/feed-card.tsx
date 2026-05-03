import "../global.css"
import { View, Text, Pressable, Modal, Image } from "react-native"
import { useState } from "react"
import { useRouter } from "expo-router"
import FeedCardExpanded from "./feed-card-expanded"
import React from "react"
type ListingPhoto = {
  photoID?: number;
  photoURL: string;
  photoPath?: string;
};


interface FeedCardProps {
  name?: string
  location?: string
  price?: string
  description?: string
  images?: ListingPhoto[]
  isEditing?: boolean
  condition?: string
  userId?: string
  listingId?: string
  sold?: boolean
  sellerPfpUrl?: string | null
}

const FeedCard = ({
  name = "Product Name",
  location = "Location",
  price = "Price",
  description = "Description",
  condition = "Condition",
  images = [],
  isEditing = false,
  userId,
  listingId,
  sold,
  sellerPfpUrl
}: FeedCardProps) => {
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()
  
  // console.log("FeedCard props:", { name, location, price, description, condition, images, isEditing, userId, listingId, sold, sellerPfpUrl })
  const formatLocation = (loc: string) => {
    if (!loc) return "Location not available";
    const parts = loc.split(',');
    if (parts.length >= 2) {
      return `${parts[parts.length - 2].trim()}, ${parts[parts.length - 1].trim()}`;
    }
    return loc;
  };

  const displayLocation = formatLocation(location);

  const handlePress = () => {
    if (isEditing) {
      router.push({
        pathname: "/upload-product",
        params: {
          isEditing: "true",
          initialName: name,
          initialPrice: price,
          initialLocation: location,
          initialCondition: condition,
          initialDescription: description,
          userId, 
          listingId,
          initialSold: sold.toString(),
        },
      })
      return
    }

    setExpanded(true)
  }

  return (
    <>
      <Pressable className="w-[46%] h-[200px] bg-gray-300 rounded-lg shadow-sm m-2 flex-col" onPress={handlePress}>
        <Image source={{ uri: images[0]?.photoURL }} className="w-full h-full rounded-lg" />
        <View className="bg-umass-red absolute bottom-0 w-full h-[25%] rounded-br-lg rounded-bl-lg flex-row flex-grow flex-1 p-1">
          <View className="flex-1 ml-0.5 max-w-[80%]">
            <Text className="flex-1 text-lg font-bold text-white">{name}</Text>
            <Text className="text-md text-white">{displayLocation}</Text>
          </View>
          <View className="justify-center absolute right-0 top-[40%] mr-2">
            <Text className="text-sm text-white">${sold? "Sold" : price}</Text>
          </View>
        </View>
      </Pressable>

      <Modal visible={expanded} transparent animationType="fade" onRequestClose={() => setExpanded(false)}>
        <FeedCardExpanded
          name={name}
          location={location}
          price={sold ? "Sold" : price}
          condition={condition}
          description={description}
          images={images}
          listingId={listingId}
          userId={userId}
          onClose={() => setExpanded(false)}
          sellerPfpUrl={sellerPfpUrl}
        />
      </Modal>
    </>
  )
}

export default FeedCard