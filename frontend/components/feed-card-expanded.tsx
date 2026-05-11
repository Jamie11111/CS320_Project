import "../global.css"
import { View, Text, ScrollView, Pressable, Image } from "react-native"
import { useRouter } from "expo-router"
import React, { useEffect } from "react"
import samplepfp from "../assets/images/samplepfp.png"
import { fetchFromBackend } from "../scripts/authFetch"
import RedButton from "./red-button"

// nathan: I contributed to this component. Here's a link to my chat history:https://docs.google.com/document/d/1sPEbSqP5HPfRucyhG0-j6rfEW1yU_ly4xRf3905LXhU/edit?usp=sharing 
// all my comments are human-written to demonstrate understanding.

// nathan: listing photo type
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
  distance?: number | null
}



const FeedCardExpanded = ({ name, location, price, condition, description, images = [], onClose, userId, listingId, sellerPfpUrl, distance}: FeedCardExpandedProps) => {
  const router = useRouter()
  const formatDistance = (distance?: number | null) => {
    if(distance === null || distance === undefined) return "";
    return `${distance.toFixed(2)} mi`;
  }

  // nathan: I attempted to handle different location formats, but the locations returned are fairly inconsistent
  const formatLocation = (loc: string) => {
    if (!loc) return "Location not available";
    const parts = loc.split(',');
    if (parts.length >= 5) {
      return `${parts[parts.length - 5].trim()}, ${parts[parts.length - 3].trim()}`;
    }
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

    // nathan: create or go to a chat when the uesr clicks "message this seller"
    try {
      const response = await fetchFromBackend(`/api/chats`, {
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
    // nathan: get the name of the seller
      const fetchSellerName = async () => {
        try {
          const response = await fetchFromBackend(`/api/user/${userId}`, {
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

      // nathan: get photos for the listing
      const fetchImages = async () => {
        try {
          const response = await fetchFromBackend(`/api/listing/${listingId}/photos`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            }
          })
          if (!response.ok) {
            throw new Error("Failed to fetch listing photos")
          }
          const data = await response.json();
          setImages(data.map((photo: any) => ({
            photoID: photo.photo_id,
            photoURL: photo.photo_url,
            photoPath: photo.photo_path,
          })))
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
      {listingImages.map((image, index) => (
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
        <Text className="text-xl font-bold max-w[25%] truncate">{name}</Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-medium flex-1">{displayLocation}</Text>
          {distance !== null && distance !== undefined && (
            <Text className="text-lg font-medium text-gray-600 ml-2">
              {formatDistance(distance)}
            </Text>
          )}
        </View>        
        <Text className="text-lg font-medium">{price === "Sold" ? price : `$${price}`}</Text>
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
      <RedButton onPressFunction={onClose} text="Close" />
      <RedButton onPressFunction={async () => {
        const chatId = await createOrGetChat()
        const prefix = `LISTING_CARD:{"id":"${listingId}"`
        try {
          const historyRes = await fetchFromBackend(`/api/chats/${chatId}/messages`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          })
          const history = historyRes.ok ? await historyRes.json() : []
          const alreadySent = Array.isArray(history) &&
            history.some((msg: { message?: string }) => msg.message?.startsWith(prefix))
          if (!alreadySent) {
            const cardPayload = JSON.stringify({
              id: listingId,
              name,
              price,
              condition,
              imageUrl: listingImages[0]?.photoURL ?? null,
            })
            await fetchFromBackend(`/api/chats/${chatId}/messages`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: `LISTING_CARD:${cardPayload}` }),
            })
          }
        } catch (err) {
          console.error("Error sending listing intro:", err)
        }
        onClose()
        router.push({ pathname: "/messages", params: { chatId, sellerName } })
      }} text="Message this Seller" />
    </View>
    </View>
  </View>
  )
}

export default FeedCardExpanded