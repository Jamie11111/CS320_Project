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
  distance?: number | null
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
  distance,
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

  const formatDistance = (distance?: number | null) => {
    if (distance === null || distance === undefined) return "";
    return `${distance.toFixed(2)} mi`;
  }
  
  // console.log("FeedCard props:", { name, location, price, description, condition, images, isEditing, userId, listingId, sold, sellerPfpUrl })
  /*const formatLocation = (loc: string) => {
    if (!loc) return "Location not available";
    console.log("Original location:", loc);
    const parts = loc.split(',');
    console.log("Parts:", parts);
    if (parts.length >= 5) {
      return `${parts[parts.length - 5].trim()}, ${parts[parts.length - 3].trim()}`;
    }
    if (parts.length >= 4) {
      return `${parts[parts.length - 2].trim()}, ${parts[parts.length - 1].trim()}`;
    }
    if (parts.length >= 3) {
      return `${parts[parts.length - 3].trim()}, ${parts[parts.length - 2].trim()}`;
    }
    return loc;
  };*/
    const formatLocation = (loc: string) => {
    if (!loc) return "Location not available";
    console.log("Original location:", loc);
    const parts = loc.split(',');
    console.log("Parts:", parts);
    if (parts.length >= 5) {
      return `${parts[parts.length - 5].trim()}, ${parts[parts.length - 3].trim()}`;
    }
    if (parts.length >= 2) {
      return `${parts[parts.length - 2].trim()}, ${parts[parts.length - 1].trim()}`;
    }
    return loc;
  };


  const displayLocation = formatLocation(location);
  console.log("Display Location:", displayLocation);
  const handlePress = () => {
    if (isEditing) {
      router.push({
        pathname: "/upload-product",
        params: {
          isEditing: "true",
          initialName: name,
          initialPrice: price,
          initialLocation: displayLocation,
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
        <View className="bg-umass-red absolute bottom-0 w-full h-[30%] rounded-br-lg rounded-bl-lg p-1">
          <View className="flex-row justify-between items-start">
            <Text
              numberOfLines={1}
              className="flex-1 text-lg font-bold text-white mr-2"
            >
              {name}
            </Text>

            <Text className="text-sm font-semibold text-white">
              {sold ? "Sold" : `$${price}`}
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
            <Text
              numberOfLines={1}
              className="flex-1 text-md text-white mr-2"
            >
              {displayLocation}
            </Text>

            {distance !== null && distance !== undefined && (
              <Text className="text-xs text-white">
                {formatDistance(distance)}
              </Text>
            )}
          </View>
        </View>      
      </Pressable>

      <Modal visible={expanded} transparent animationType="fade" onRequestClose={() => setExpanded(false)}>
        <FeedCardExpanded
          name={name}
          location={location}
          distance={distance}
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