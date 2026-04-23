import { View, Text, ScrollView, Pressable, Alert} from "react-native"
import "../global.css"
import Navbar from "../components/navbar"
import MyProfileBanner from "../components/my-profile-banner"
import FeedCard from "../components/feed-card"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import React from "react"
import { fetchWithAuth } from "../scripts/authFetch"

type ListingPhoto = {
  photoID?: number;
  photoURL: string;
  photoPath?: string;
};

const MyProfilePage = () => {
  type userData = {
    user_id: string
    name: string
    email: string
    location: string
  }
  type Listing = {
  user_id: string
  listing_id: string
  product_name: string
  product_desc: string | null
  item_condition: string
  price: string
  sold: boolean
  photos: ListingPhoto[]
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
          const normalized = data.map((listing: any) => ({
            ...listing,
            photos: listing.photos.map((photo: any) => ({
                photoID: photo.photo_id,
                photoURL: photo.photo_url,
                photoPath: photo.photo_path,
            }))
          }));
          console.log("Normalized photos", normalized[0].photos) // Debugging log
          setListings(normalized);
        } catch (error) {
          console.error("Error fetching listings", error)
        }
      }
  
      fetchListings()
    }, [])

  
  return (
    <View>
      <View className="h-[92%]">
     
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
              listingId={listing.listing_id}
              images={listing.photos}
              isEditing={true}
              sold={listing.sold}
            />
          ))}
        </ScrollView>
      </View>

      <Navbar canNavigate={userLocation.trim() !== ""}/>
    </View>
  )
}

export default MyProfilePage
