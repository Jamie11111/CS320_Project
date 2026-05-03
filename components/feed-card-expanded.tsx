import "../global.css"
import { View, Text, ScrollView, Pressable, Image } from "react-native"
import { useRouter } from "expo-router"
import React, { useEffect } from "react"
import samplepfp from "../assets/images/samplepfp.png"
import { fetchWithAuth } from "../scripts/authFetch"
import RedButton from "./red-button"
type ListingPhoto = {
  photoID?: number;
  photoURL: string;
  photoPath?: string;
};

interface FeedCardExpandedProps {
  name: string
  location: string
  price: string
  description: string
  condition: string
  images?: ListingPhoto[]
  onClose: () => void
  userId: string
  listingId: string
  sellerPfpUrl?: string | null
}



const FeedCardExpanded = ({ name, location, price, condition, description, images = [], onClose, userId, listingId, sellerPfpUrl}: FeedCardExpandedProps) => {
  const router = useRouter()
  const formatLocation = (loc: string) => {
    if (!loc) return "Location not available";
    const parts = loc.split(',');
    if (parts.length >= 2) {
      return `${parts[parts.length - 2].trim()}, ${parts[parts.length - 1].trim()}`;
    }
    return loc;
  };

  const displayLocation = formatLocation(location);
  const displayImages = images.slice(0, 5)
  const [sellerName, setName] = React.useState("")
  const [listingImages, setImages] = React.useState<ListingPhoto[]>([])
  const createOrGetChat = async () => {
    try {
      const response = await fetchWithAuth(`http://localhost:3000/api/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seller_id: userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create or get chat');
      }
      console.log("Chat response status:", response.status);

      const data = await response.json();
      return data.chat_id; 
    } catch (error) {
      console.error('Error creating/getting chat:', error);
      throw error;
    }
  };
  useEffect(() => {
      const fetchSellerName = async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/user/${userId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            }
          })
          if (!response.ok) {
            throw new Error("Failed to fetch seller name")
          }
          const data = await response.json()
          setName(data.name)
          console.log("Fetched seller name:", data.name) 
        } catch (error) {
          console.error("Error fetching seller name:", error)
        }
      }

      const fetchImages = async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/listing/${listingId}/photos`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            }
          })
          if (!response.ok) {
            throw new Error("Failed to fetch listing photos")
          }
          const data = await response.json()
          setImages(data)
        } catch (error) {
          console.error("Error fetching listing photos:", error)
        }
      }
      fetchSellerName()
      fetchImages()
    }, [userId, listingId])
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
          source={{ uri: image.photoURL }}
          className="rounded-lg w-96 h-96 mr-2"
        />
      ))}
      <Text> </Text>
      </ScrollView>
    </View>

    <View className="p-4">
      <View className="flex-row items-start justify-between">
      <View className="flex-1 pr-3">
        <Text className="text-xl font-bold">{name}</Text>
        <Text className="text-lg font-medium">{displayLocation}</Text>
        <Text className="text-lg font-medium">${price}</Text>
        <Text className="text-lg font-medium">{condition}</Text>
      </View>
      <View className="flex-col">
        <Pressable
          onPress={() => {
            onClose()
            router.push({
          pathname: "/profile-feed",
          params: { userId },
            })
          }}
        >
          <Image source={sellerPfpUrl ? { uri: sellerPfpUrl } : samplepfp} className={`bg-gray-200 w-16 h-16 rounded-full ml-2 mb-2`}></Image>
        </Pressable>
        <Text className="text-center text-sm font-medium">{sellerName}</Text>

      </View>
      
      </View>
      <ScrollView
      className="mt-2 h-64 mb-10" 
      showsVerticalScrollIndicator={true}
      contentContainerStyle={{ paddingBottom: 8 }}
      >
      <Text className={"text-lg text-gray-700"}>{description}</Text>
      </ScrollView>
    </View>
    <View className="flex-row justify-around">
      {/* <Pressable onPress={onClose} className="mb-4 mt-auto w-52 bg-umass-red rounded-xl p-3 items-center">
      <Text className="text-white font-bold">Close</Text>
      </Pressable> */}
      <RedButton onPressFunction={onClose} text="Close" />
      {/* <Pressable onPress={async () => {
        onClose()
        router.push({ pathname: "/messages", params: { chatId: await createOrGetChat() , sellerName: sellerName} })
      }} className="mb-4 mt-auto w-52 bg-umass-red rounded-xl p-3 items-center">
        <Text className="text-white font-bold">Message this Seller</Text>
      </Pressable> */}
      <RedButton onPressFunction={async () => {
        onClose()
        router.push({ pathname: "/messages", params: { chatId: await createOrGetChat() , sellerName: sellerName} })
      }} text="Message this Seller" />
    </View>
    </View>
  </View>
  )
}

export default FeedCardExpanded