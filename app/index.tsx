import { StyleSheet, Text, View, Image, TextInput, Pressable } from 'react-native'
import "../global.css"
import { storage } from '../lib/firebase'
import {useEffect, useState} from 'react'
import Navbar from '../components/navbar'
import FeedCard from '../components/feed-card'
import { ScrollView } from 'react-native'
import SearchBar from '../components/search-bar'
import UploadProductPage from './upload-product'
import { useRouter } from 'expo-router'
import React from 'react'
import { fetchWithAuth } from '../scripts/authFetch'

type ListingPhoto = {
  photoID?: number;
  photoURL: string;
  photoPath?: string;
};
type Listing = {
  user_id: string
  product_name: string
  product_desc: string | null
  item_condition: string
  price: string
  sold: boolean
  listing_id: string
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
const Home = () => {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  useEffect(() => {
    const fetchListings = async () => {
      try {

        const userRes = await fetchWithAuth('http://localhost:3000/api/user');
        if (userRes.ok) {
          const uData = await userRes.json();
          setCurrentUser(uData);
        }

        const response = await fetchWithAuth('http://localhost:3000/api/listings', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          }
        });
        console.log("Fetch response:", response); // Debugging log
        if (!response.ok) {
          throw new Error(`Failed: ${response.status}`);
        }

        const data: Listing[] = await response.json();
        const normalized = data.map((listing: any) => ({
          ...listing,
          photos: listing.photos.map((photo: any) => ({
              photoID: photo.photo_id,
              photoURL: photo.photo_url,
              photoPath: photo.photo_path,
          }))
        }));


        if (!Array.isArray(data)) throw new Error("Invalid response format")
        setListings(normalized);
        console.log("Fetched listings:", normalized[0]); // Debugging log
      } catch (error) {
        console.error("Error fetching listings", error)
      }
    }

    fetchListings()
  }, [])
  return (
    <View>

      <View className="h-[92%]">
        <SearchBar />
        <ScrollView contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", marginLeft: 3}}>
          {listings.map((listing, index) => (
            
            <FeedCard
              key={index}
              name={listing.product_name}
              price={listing.price}
              location={"Amherst, MA"}
              description={listing.product_desc ?? ""}
              condition={listing.item_condition}
              userId={listing.user_id}
              images={listing.photos}
              listingId={listing.listing_id}
              sold={listing.sold}
            />
          ))} 
        </ScrollView>
      </View>
      <Navbar userPfp={currentUser?.profile_picture_url || null} />
    </View>
  )
}

export default Home


