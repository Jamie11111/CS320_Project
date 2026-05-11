import { View, Switch, Text, TextInput, Pressable } from 'react-native'
import "../global.css"
import {useContext, useEffect, useState} from 'react'
import Navbar from '../components/navbar'
import FeedCard from '../components/feed-card'
import { ScrollView, FlatList, ActivityIndicator } from 'react-native'
import SearchBar from '../components/search-bar'
import React from 'react'
import { fetchFromBackend } from "../scripts/authFetch"
import { DataContext } from '../components/data-context'

// nathan: I contributed to this page. Here's the link to my chat history: https://docs.google.com/document/d/1_EMUZ61HZkIx1ohpyCPF742EveQTH4tviphskW9GwLY/edit?usp=sharing
// all my comments are human-written to demonstrate understanding.
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
  location: string
  distance: number | null // automatically returned whenever filterListings is called
}
type SortBy = 'price' | 'distance' | 'relevance' | 'date'

const Home = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const {cachedData, updateCache} = useContext(DataContext);
  const { profileData } = cachedData;
  const [currentUser, setCurrentUserFn] = useState<any>(profileData);
  const setCurrentUser = (value: React.SetStateAction<any>) => {
    setCurrentUserFn(value);
    updateCache("profileData", value);
  }
  
  const [searchQuery, setSearchQuery] = useState("")

  const [sortBy, setSortBy] = useState<SortBy>('distance')
  const [condition, setCondition] = useState<'new' | 'good' | 'fair' | 'poor' | undefined>(undefined)
  const [priceLimit, setPriceLimit] = useState<string>("")
  const [sold, setSold] = useState<boolean | undefined>(false)
  const [showFilters, setShowFilters] = useState(false)
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>([])

  const toggleFilters = () => {
   setShowFilters(!showFilters);
 };


  const normalizeSuggestions = (raw: unknown): string[] => {
    if (!Array.isArray(raw)) return []
    return raw
      .map((item) => {
        if (typeof item === "string") return item
        if (item && typeof item === "object") {
          const o = item as Record<string, unknown>
          const candidate =
            o.suggestion ?? o.query ?? o.product_name ?? o.name
          if (typeof candidate === "string") return candidate
        }
        return null
      })
      .filter((value): value is string => Boolean(value))
      .slice(0, 5)
  }


  const fetchNextListings = async (
    limit: number = 10,
    offset: number = 0,
    queryForRequest?: string,
    sortForRequest?: SortBy,
  ) => {
    const params = new URLSearchParams()
    const q =
      queryForRequest !== undefined
        ? queryForRequest.trim()
        : searchQuery.trim()
    if (q.length > 0) params.append("query", q)
    const sort = sortForRequest ?? sortBy
    if (sortBy) params.append("sort_by", sort);
    if (condition) params.append("condition", condition);
    if (priceLimit.trim()) params.append("priceLimit", priceLimit.trim());
    if (sold !== undefined) params.append("sold", String(sold));

    params.set("limit", String(limit));
    params.set("offset", String(offset));

    // nathan: fetch listings using search parameters and pagination limits, then store them in a normalized array 
    const response = await fetchFromBackend(`/api/listings?${params.toString()}`);    
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

    return normalized;
  }

  const fetchListings = async (activeQuery: string, sortForRequest?: SortBy) => {
    const trimmed = activeQuery.trim()
    setOffset(0)
    setHasMore(true)
    setLoading(true)
    setListings([])
    setSuggestedQueries([])

    try {
      const page = await fetchNextListings(10, 0, trimmed, sortForRequest)
      setListings(page)
      setOffset(page.length)
      setHasMore(page.length >= 10)

      if (trimmed.length > 0 && page.length === 0) {
        try {
          const suggestionRes = await fetchFromBackend(
            `/api/listings/search-suggestions?query=${encodeURIComponent(trimmed)}`,
          )
          if (suggestionRes.ok) {
            const payload = await suggestionRes.json()
            setSuggestedQueries(normalizeSuggestions(payload?.suggestions))
          }
        } catch (suggestionError) {
          console.error("Error fetching search suggestions", suggestionError)
        }
      }
    } catch (error) {
      console.error("Error fetching listings", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMoreListings = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const listings = await fetchNextListings(10, offset);
      if(listings.length === 0) setHasMore(false);
      setListings(prev => [...prev, ...listings]);
      setOffset(prev => prev + listings.length);
    } catch (error) {
      console.error("Error fetching listings", error)
    } finally {
      setLoading(false);
    }
  }

  const runSearch = async (query: string) => {
    const trimmed = query.trim()

    // sort by relevance whenever nonempty query submitted
    const nextSort: SortBy = trimmed.length > 0 ? "relevance" : sortBy
    
    setSearchQuery(trimmed)
    if (trimmed.length > 0) setSortBy("relevance") 

    await fetchListings(trimmed, nextSort)
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
     className={`py-2 px-4 rounded-full border mr-2 mb-2 ${active ? 'bg-umass-red border-umass-red' : 'bg-white border-gray-300'}`}
   >
     <Text className={`font-bold ${active ? 'text-white' : 'text-gray-600'}`}>{label}</Text>
   </Pressable>
 );


  return (
    <View>

      <View className="h-[92%]">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitSearch={runSearch}
          onFilterPress={toggleFilters}
          hideHistory={showFilters}
        />
        

        {showFilters && (
          <View className="mx-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-3">Refine Search</Text>
            
            {/* Sort Section */}
            <Text className="font-semibold text-gray-500 mb-2 uppercase text-[10px] tracking-wider">Sort By</Text>
            <View className="flex-row flex-wrap">
              <FilterButton label="Newest" active={sortBy === "date"} onPress={() => setSortBy("date")} />
              <FilterButton label="Relevance" active={sortBy === "relevance"} onPress={() => setSortBy("relevance")} />
              <FilterButton label="Price" active={sortBy === "price"} onPress={() => setSortBy("price")} />
              <FilterButton label="Distance" active={sortBy === "distance"} onPress={() => setSortBy("distance")} />
            </View>

            {/* Condition Section */}
            <Text className="font-semibold text-gray-500 mt-2 mb-2 uppercase text-[10px] tracking-wider">Condition</Text>
            <View className="flex-row flex-wrap">
              <FilterButton label="Any" active={condition === undefined} onPress={() => setCondition(undefined)} />
              <FilterButton label="New" active={condition === "new"} onPress={() => setCondition("new")} />
              <FilterButton label="Good" active={condition === "good"} onPress={() => setCondition("good")} />
              <FilterButton label="Fair" active={condition === "fair"} onPress={() => setCondition("fair")} />
              <FilterButton label="Poor" active={condition === "poor"} onPress={() => setCondition("poor")} />
            </View>

            {/* Price and Availability Row */}
            <View className="flex-row items-center justify-between mt-4">
              <View className="flex-1 mr-4">
                <Text className="font-semibold text-gray-500 mb-1 uppercase text-[10px] tracking-wider">Max Price</Text>
                <TextInput
                  value={priceLimit}
                  onChangeText={setPriceLimit}
                  placeholder="$ 0.00"
                  keyboardType="numeric"
                  className="bg-white border border-gray-300 rounded-lg p-2 text-gray-800"
                />
              </View>
              <View className="items-center">
                <Text className="font-semibold text-gray-500 mb-1 uppercase text-[10px] tracking-wider">Available Only</Text>
                <Switch
                  value={sold === false}
                  onValueChange={(val) => setSold(val ? false : undefined)}
                  trackColor={{ false: "#d1d5db", true: "#880000" }} // Using your UMass Red
                  thumbColor={"#fff"}
                />
              </View>
            </View>

            {/* Apply Button */}
            <Pressable
              onPress={() => {
                fetchListings(searchQuery);
                setShowFilters(false);
              }}
              className="bg-umass-red mt-6 py-3 rounded-xl items-center shadow-md active:opacity-90"
            >
              <Text className="text-white font-bold text-lg">Apply Filters</Text>
            </Pressable>
          </View>
        )}        
        {/* nathan:  */}
        <FlatList
          data = {listings}
          key={2}
          numColumns={2} 
          contentContainerStyle={{ paddingHorizontal: 3 }}
          keyExtractor={(item) => item.listing_id.toString()}
          ListEmptyComponent={
            !loading && searchQuery.trim().length > 0 ? (
              <View style={{ paddingHorizontal: 12, paddingVertical: 16 }}>
                {suggestedQueries.length > 0 ? (
                  <View>
                    <Text>
                      We couldn't find anything for "{searchQuery}". Try
                      searching for:
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        marginTop: 8,
                      }}
                    >
                      {suggestedQueries.map((suggestion) => (
                        <Pressable
                          key={suggestion}
                          onPress={() => runSearch(suggestion)}
                          style={{
                            borderWidth: 1,
                            borderRadius: 999,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            marginRight: 8,
                            marginBottom: 8,
                          }}
                        >
                          <Text>{suggestion}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ) : (
                  <Text>No results found for "{searchQuery}"</Text>
                )}
              </View>
            ) : null
          }
          renderItem={({ item }) => (<FeedCard
            name={item.product_name}
            price={item.price}
            location={item.location}
            distance={item.distance}
            description={item.product_desc ?? ""}
            condition={item.item_condition}
            userId={item.user_id}
            images={item.photos}
            listingId={item.listing_id}
            sold={item.sold}
          />)}
          onEndReached={() => fetchMoreListings()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading ? <ActivityIndicator size="large" /> : null}
        />

      </View>
      <Navbar userPfp={currentUser?.profile_picture_url || null} />
    </View>
  )
}

export default Home


