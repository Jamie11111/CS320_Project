import { View, Text, ScrollView } from "react-native"
import "../global.css"
import Navbar from "../components/navbar"
import ProfileFeedBanner from "../components/profile-feed-banner"
import FeedCard from "../components/feed-card"
import React, { useEffect } from "react"
import { fetchWithAuth } from "../scripts/authFetch"
import { useLocalSearchParams } from "expo-router"
import couch1 from "../assets/images/couch1.jpg"
import couch2 from "../assets/images/couch2.webp"
const ProfileFeedPage = () => {
    const { userId } = useLocalSearchParams<{ userId?: string }>()
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

  const [userData, setUserData] = React.useState<userData | null>(null)
  const [listings, setListings] = React.useState<Listing[]>([])

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const userResponse = await fetchWithAuth(`http://localhost:3000/api/user/${userId}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const userData = await userResponse.json();
        setUserData(userData);
        const response = await fetchWithAuth(`http://localhost:3000/api/listings/user/${userId}`, {
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
    <View >
      <View className="h-[92%]">
        <ProfileFeedBanner authorName={userData?.name || "John Doe"} authorLocation={userData?.location || "Amherst, MA"} />
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
              />
            ))}
          </ScrollView>

      </View>
      <Navbar />
    </View>
  )
}

export default ProfileFeedPage
