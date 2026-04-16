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
    address: string | null
    latitude: number | null
    longitude: number | null
    profile_picture_url: string | null
  }
  type Listing = {
  user_id: string
  listing_id: string
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
  const handleLocationUpdate = async (locationData: { address: string | null; latitude: number | null; longitude: number | null }) => {

  setUserLocation(locationData.address || "");
  if (userData) {
    setUserData({
      ...userData,
      address: locationData.address,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    });
  }

  try {
    const response = await fetchWithAuth('http://localhost:3000/api/user', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: locationData.address,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Server update failed:", errorData);
      Alert.alert("Sync Failed", "Could not save your new location to the server.");
    } else {
      console.log("Location synced successfully!");
    }
  } catch (error) {
    console.error("Network error during location sync:", error);
    Alert.alert("Sync Error", "Make sure your backend is running.");
  }
  };

const handlePfpUpdate = async (localUri: string) => {
  if (!userData) return;

  const oldUrl = userData.profile_picture_url;
  setUserData({ ...userData, profile_picture_url: localUri });

  try {
    
    const response = await fetchWithAuth('http://localhost:3000/api/user', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profile_picture_url: localUri, 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend Error:", errorData);
      throw new Error("Upload failed");
    }

    console.log("PFP URL updated in database");

  } catch (error) {
    console.error("PFP update error:", error);
    Alert.alert("Error", "Could not save profile picture.");
    setUserData({ ...userData, profile_picture_url: oldUrl });
  }
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

          if (userData.address) {
            setUserLocation(userData.address);
          }

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
     
        <MyProfileBanner name={userData?.name || "John Doe"} location={userLocation} email={userData?.email || "johndoe@example.com"} onLocationChange={handleLocationUpdate} profilePictureUrl={userData?.profile_picture_url || null} onPfpChange={handlePfpUpdate} />
        <ScrollView contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", marginLeft: 3}}>
          {listings.map((listing, index) => (
            <FeedCard
              key={index}
              name={listing.product_name}
              price={listing.price}
              location={userLocation}
              description={listing.product_desc ?? ""}
              condition={listing.item_condition}
              userId={listing.user_id}
              listingId={listing.listing_id}
              images={[couch1, couch2]}
              isEditing={true}
            />
          ))}
        </ScrollView>
      </View>

      <Navbar canNavigate={userLocation.trim() !== ""} userPfp={userData?.profile_picture_url || null} />
    </View>
  )
}

export default MyProfilePage
