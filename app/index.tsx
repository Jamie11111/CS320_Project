import { View } from 'react-native'
import "../global.css"
import {useEffect, useState} from 'react'
import Navbar from '../components/navbar'
import FeedCard from '../components/feed-card'
import { ScrollView } from 'react-native'
import SearchBar from '../components/search-bar'
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
  location: string
  // description: string
  // condition: string
  // images: FeedImageSource[]
}
const Home = () => {
  const [listings, setListings] = useState<Listing[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchListings = async (query: string) => {
    try {
      const encodedQuery = encodeURIComponent(query.trim())
      const response = await fetchWithAuth(`http://localhost:3000/api/listings?query=${encodedQuery}&sort_by=distance&lmt=40`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
      });
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
    } catch (error) {
      console.error("Error fetching listings", error)
    }
  }

  const runSearch = async (query: string) => {
    const trimmed = query.trim()
    setSearchQuery(trimmed)
    await fetchListings(trimmed)
  }

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const userRes = await fetchWithAuth('http://localhost:3000/api/user');
        if (userRes.ok) {
          const uData = await userRes.json();
          setCurrentUser(uData);
        }
      } catch (error) {
        console.error("Error fetching user", error)
      }

      await fetchListings("")
    }

    bootstrap()
  }, [])
  return (
    <View>

      <View className="h-[92%]">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitSearch={runSearch}
        />
        <ScrollView contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", marginLeft: 3}}>
          {listings.map((listing, index) => (
            <React.Fragment key={listing.listing_id || String(index)}>
              <FeedCard
                name={listing.product_name}
                price={listing.price}
                location={listing.location}
                description={listing.product_desc ?? ""}
                condition={listing.item_condition}
                userId={listing.user_id}
                images={listing.photos}
                listingId={listing.listing_id}
                sold={listing.sold}
              />
            </React.Fragment>
          ))} 
        </ScrollView>
      </View>
      <Navbar userPfp={currentUser?.profile_picture_url || null} />
    </View>
  )
}

export default Home


