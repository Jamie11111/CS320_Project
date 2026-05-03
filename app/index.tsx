import { View, Text, ScrollView } from "react-native";
import "../global.css";
import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import FeedCard from "../components/feed-card";
import SearchBar from "../components/search-bar";
import React from "react";
import { fetchWithAuth } from "../scripts/authFetch";

type ListingPhoto = {
  photoID?: number;
  photoURL: string;
  photoPath?: string;
};
type Listing = {
  user_id: string;
  product_name: string;
  product_desc: string | null;
  item_condition: string;
  price: string;
  sold: boolean;
  listing_id: string;
  photos: ListingPhoto[];
  // using API Listings (above) but actual listings (below) should have more data
  // id: number
  // name: string
  // price: number
  location: string;
  // description: string
  // condition: string
  // images: FeedImageSource[]
};

function normalizeSuggestions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        for (const key of ["term", "query", "text", "label"] as const) {
          const v = o[key];
          if (typeof v === "string" && v) return v;
        }
      }
      return "";
    })
    .filter(Boolean);
}

function formatSuggestionList(suggestions: string[]): string {
  if (suggestions.length === 0) return "";
  if (suggestions.length === 1) return suggestions[0];
  if (suggestions.length === 2)
    return `${suggestions[0]} and ${suggestions[1]}`;
  return `${suggestions.slice(0, -1).join(", ")}, and ${suggestions[suggestions.length - 1]}`;
}

const Home = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [noResultsMessage, setNoResultsMessage] = useState<string | null>(null);

  const fetchListings = async (
    query: string,
  ): Promise<{ ok: boolean; listings: Listing[] }> => {
    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const response = await fetchWithAuth(
        `http://localhost:3000/api/listings?query=${encodedQuery}&sort_by=distance&lmt=40`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) {
        throw new Error(`Failed: ${response.status}`);
      }

      const data: Listing[] = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid response format");
      const normalized = data.map((listing: any) => ({
        ...listing,
        photos: listing.photos.map((photo: any) => ({
          photoID: photo.photo_id,
          photoURL: photo.photo_url,
          photoPath: photo.photo_path,
        })),
      }));

      return { ok: true, listings: normalized };
    } catch (error) {
      console.error("Error fetching listings", error);
      return { ok: false, listings: [] };
    }
  };

  const fetchSearchSuggestions = async (
    query: string,
  ): Promise<{ ok: boolean; suggestions: string[] }> => {
    try {
      const encoded = encodeURIComponent(query);
      const response = await fetchWithAuth(
        `http://localhost:3000/api/listings/search-suggestions?query=${encoded}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!response.ok) {
        return { ok: false, suggestions: [] };
      }
      const body = (await response.json()) as { suggestions?: unknown };
      return {
        ok: true,
        suggestions: normalizeSuggestions(body.suggestions),
      };
    } catch (error) {
      console.error("Error fetching search suggestions", error);
      return { ok: false, suggestions: [] };
    }
  };

  const runSearch = async (query: string) => {
    const trimmed = query.trim();
    setNoResultsMessage(null);
    setSearchQuery(trimmed);
    const result = await fetchListings(trimmed);
    if (!result.ok) {
      return;
    }
    setListings(result.listings);
    if (result.listings.length > 0) {
      return;
    }
    if (trimmed.length === 0) {
      return;
    }
    const sugResult = await fetchSearchSuggestions(trimmed);
    if (!sugResult.ok || sugResult.suggestions.length === 0) {
      setNoResultsMessage(
        `Sorry, we couldn't find anything that matched "${trimmed}".`,
      );
    } else {
      const formatted = formatSuggestionList(sugResult.suggestions);
      setNoResultsMessage(
        `We didn't find anything for "${trimmed}". Try searching for ${formatted}.`,
      );
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const userRes = await fetchWithAuth("http://localhost:3000/api/user");
        if (userRes.ok) {
          const uData = await userRes.json();
          setCurrentUser(uData);
        }
      } catch (error) {
        console.error("Error fetching user", error);
      }

      const initial = await fetchListings("");
      if (initial.ok) {
        setListings(initial.listings);
      }
    };

    bootstrap();
  }, []);
  return (
    <View>
      <View className="h-[92%]">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitSearch={runSearch}
        />
        {noResultsMessage != null ? (
          <Text className="text-center text-gray-600 px-4 py-3 text-sm">
            {noResultsMessage}
          </Text>
        ) : null}
        <ScrollView
          contentContainerStyle={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginLeft: 3,
          }}
        >
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
  );
};

export default Home;
