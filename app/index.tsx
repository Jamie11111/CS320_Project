import { StyleSheet, Text, View, Image, TextInput, Pressable } from 'react-native'
import "../global.css"
import { storage } from '../lib/firebase'
import {useEffect, useState} from 'react'
import Navbar from '../components/navbar'
import FeedCard from '../components/feed-card'
import { ScrollView } from 'react-native'
import UploadProductPage from './upload-product'
import { useRouter } from 'expo-router'
import couch1 from "../assets/images/couch1.jpg"
import couch2 from "../assets/images/couch2.webp"
import React from 'react'
import { fetchWithAuth } from '../scripts/authFetch'

type FeedImageSource = import("react-native").ImageSourcePropType | string
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
const Home = () => {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetchWithAuth('http://localhost:3000/api/listings', {
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
            className="absolute z-10 bottom-12 right-4 bg-umass-red rounded-full px-5 py-3 shadow-lg"
          >
            <Text className="text-white text-2xl font-bold">+</Text>
        </Pressable>
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
              images={[couch1, couch2]}
            />
          ))} 
        </ScrollView>
      </View>
      <Navbar />
    </View>
  )
}

export default Home


