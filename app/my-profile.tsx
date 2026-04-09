import { View, Text, ScrollView, Pressable, Alert} from "react-native"
import "../global.css"
import Navbar from "../components/navbar"
import MyProfileBanner from "../components/my-profile-banner"
import FeedCard from "../components/feed-card"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import React from "react"
import { fetchWithAuth } from "../scripts/authFetch"
import couch1 from "../assets/images/couch1.jpg"
import couch2 from "../assets/images/couch2.webp"
const MyProfilePage = () => {
  type userData = {
    user_id: string
    name: string
    email: string
    location: string
  }
  type Listing = {
  user_id: string
  product_name: string
  product_desc: string | null
  item_condition: string
  price: string
  // using API Listings (above) but actual listings (below) should have more dataa
  // id: number
  // name: string
  // price: number
  // location: string
  // description: string
  // condition: string
  // images: FeedImageSource[]
}
  const router = useRouter()
  const [userLocation, setUserLocation] = useState("Amherst, MA")
  const [listings, setListings] = useState<Listing[]>([])
  const [userData, setUserData] = useState<userData | null>(null)
  const handleLocationUpdate = (newLoc: string) => {
    setUserLocation(newLoc); 
  };
  useEffect(() => {

      const fetchListings = async () => {
        try {
          const userResponse = await fetchWithAuth('http://localhost:3000/api/user', {
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!userResponse.ok) {
            alert('Failed to get user information');
            return;
          } 

          const userData = await userResponse.json();
          setUserData(userData);  
          const response = await fetchWithAuth(`http://localhost:3000/api/listings/user/${userData.user_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
          });
          if (!response.ok) {
            throw new Error(`Failed: ${response.status}`);
          }
  
          const data: unknown = await response.json();
          if (!Array.isArray(data)) throw new Error("Invalid response format")
  
          setListings(data as Listing[]);
          console.log("Fetched listings:", data);
  
        } catch (error) {
          console.error("Error fetching listings", error)
        }
      }
  
      fetchListings()
    }, [])

  
  return (
    <View>
      <View className="h-[92%]">
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/upload-product",
              params: { isEditing: "false" },
            })
          }
          className="absolute z-10 bottom-12 mt-6 right-4 bg-umass-red rounded-full px-5 py-3 shadow-lg"
        >
          <Text className="text-white text-2xl font-bold ">+</Text>
        </Pressable>
        <MyProfileBanner name={userData?.name || "John Doe"} location={userLocation} email={userData?.email || "johndoe@example.com"} onLocationChange={handleLocationUpdate}/>
        <ScrollView contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", marginLeft: 3}}>
          {listings.map((listing, index) => (
            <FeedCard
              key={index}
              name={listing.product_name}
              price={listing.price}
              location={userData?.location || "Amherst, MA"}
              description={listing.product_desc ?? ""}
              condition={listing.item_condition}
              userId={listing.user_id}
              images={[couch1, couch2]}
              isEditing={true}
            />
          ))}
        </ScrollView>
      </View>

      <Navbar canNavigate={userLocation.trim() !== ""}/>
    </View>
  )
}

export default MyProfilePage
