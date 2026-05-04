import { View, Switch, Text, TextInput, Pressable } from 'react-native'
import "../global.css"
import {useEffect, useState} from 'react'
import Navbar from '../components/navbar'
import FeedCard from '../components/feed-card'
import { ScrollView } from 'react-native'
import SearchBar from '../components/search-bar'
import React from 'react'
import { fetchFromBackend } from "../scripts/authFetch"

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
  distance: number // automatically returned whenever filterListings is called
  // description: string
  // condition: string
  // images: FeedImageSource[]
}
const Home = () => {
  const [listings, setListings] = useState<Listing[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const [sortBy, setSortBy] = useState<'price' | 'distance' | 'relevance' | 'date'>('distance')
  const [condition, setCondition] = useState<'new' | 'good' | 'fair' | 'poor' | undefined>(undefined)
  const [priceLimit, setPriceLimit] = useState<string>("")
  const [sold, setSold] = useState<boolean | undefined>(false)
  const [showFilters, setShowFilters] = useState(false)

  const fetchListings = async (query: string) => {
    try {

      const params = new URLSearchParams();

      if (query.trim()) params.append("query", query.trim());
      if (sortBy) params.append("sort_by", sortBy);
      if (condition) params.append("condition", condition);
      if (priceLimit.trim()) params.append("priceLimit", priceLimit.trim());
      if (sold !== undefined) params.append("sold", String(sold));

      const response = await fetchFromBackend(`http://localhost:3000/api/listings?${params.toString()}`, {
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
        const userRes = await fetchFromBackend('/api/user');
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

  const FilterButton = ({ label, active, onPress }: any) => (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: active ? "#111" : "white",
      }}
    >
      <Text style={{ color: active ? "white" : "black" }}>{label}</Text>
    </Pressable>
  );

  return (
    <View>

      <View className="h-[92%]">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitSearch={runSearch}
        />
        <Pressable
          onPress={() => setShowFilters(!showFilters)}
          style={{
            marginHorizontal: 12,
            marginTop: 8,
            padding: 10,
            borderRadius: 10,
            borderWidth: 1,
            alignItems: "center",
          }}
        >
          <Text>{showFilters ? "Hide Filters" : "Filters"}</Text>
        </Pressable>

        {showFilters && (
          <View style={{ margin: 12, padding: 12, borderWidth: 1, borderRadius: 12 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 8 }}>Sort By</Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              <FilterButton label="Newest" active={sortBy === "date"} onPress={() => setSortBy("date")} />
              <FilterButton label="Relevance" active={sortBy === "relevance"} onPress={() => setSortBy("relevance")} />
              <FilterButton label="Price" active={sortBy === "price"} onPress={() => setSortBy("price")} />
              <FilterButton label="Distance" active={sortBy === "distance"} onPress={() => setSortBy("distance")} />
            </View>

            <Text style={{ fontWeight: "bold", marginTop: 10, marginBottom: 8 }}>Condition</Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              <FilterButton label="Any" active={condition === undefined} onPress={() => setCondition(undefined)} />
              <FilterButton label="New" active={condition === "new"} onPress={() => setCondition("new")} />
              <FilterButton label="Good" active={condition === "good"} onPress={() => setCondition("good")} />
              <FilterButton label="Fair" active={condition === "fair"} onPress={() => setCondition("fair")} />
              <FilterButton label="Poor" active={condition === "poor"} onPress={() => setCondition("poor")} />
            </View>

            <Text style={{ fontWeight: "bold", marginTop: 10 }}>Price Limit</Text>

            <TextInput
              value={priceLimit}
              onChangeText={setPriceLimit}
              placeholder="Max price"
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderRadius: 8,
                padding: 10,
                marginTop: 6,
                marginBottom: 12,
              }}
            />

            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ marginRight: 10 }}>Available only</Text>
              <Switch
                value={sold === false}
                onValueChange={(val) => setSold(val ? false : undefined)}
              />
            </View>

            <Pressable
              onPress={() => fetchListings(searchQuery)}
              style={{
                backgroundColor: "#111",
                padding: 12,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Apply Filters</Text>
            </Pressable>
          </View>
        )}        
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


