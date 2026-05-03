import "../global.css"
import { View, Text, Pressable, TextInput, Image } from "react-native"
import React, { useEffect, useState } from "react"
import search from "../assets/images/search.png"
import { SearchHistoryManager } from "../routes/searchHistory"
import { useIsFocused } from '@react-navigation/native';
type SearchBarProps = {
  value: string
  onChangeText: (text: string) => void
  onSubmitSearch: (query: string) => Promise<void> | void
}

const SearchBar = ({ value, onChangeText, onSubmitSearch }: SearchBarProps) => {
  const [clicked, setClicked] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const isFocused = useIsFocused();
  const loadHistory = async () => {
    const history = await SearchHistoryManager.getHistory()
    setRecentSearches(history)
    setShowHistory(true)
  }

  const submitSearch = async (rawQuery: string) => {
    const query = rawQuery.trim()
    if (!query) return

    await SearchHistoryManager.addSearch(query)
    await onSubmitSearch(query)
    const updated = await SearchHistoryManager.getHistory()
    setRecentSearches(updated)
    setShowHistory(false)
  }

  const useRecentSearch = async (term: string) => {
    onChangeText(term)
    await SearchHistoryManager.addSearch(term)
    await onSubmitSearch(term)
    const updated = await SearchHistoryManager.getHistory()
    setRecentSearches(updated)
    setShowHistory(false)
  }
  useEffect(() => {
    if (!isFocused) {
      setClicked(false);
    } 
  }, [isFocused])

  return (
    <View className="w-full flex items-center background-transparent relative">
      <Pressable onPress={() => setClicked(true)} className="bg-umass-red w-[80%] h-10 rounded-lg shadow-lg">
        {!clicked && <Image source={search} className="w-6 h-6 absolute top-2 left-3" />}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={async () => {
            setClicked(true)
            await loadHistory()
          }}

          onSubmitEditing={async () => {
            await submitSearch(value)
          }}
          returnKeyType="search"
          className={clicked ? "h-10 pl-4 text-white" : "h-10 pl-10 text-white"}
          placeholder="Search listings"
          placeholderTextColor={"rgba(255, 255, 255, 0.7)"}
        />
      </Pressable>

      {showHistory && recentSearches.length > 0 && (
        <View className="w-[80%] bg-white rounded-lg mt-2 shadow-lg overflow-hidden">
          {recentSearches.map((term) => (
            <Pressable
              key={term}
              className="px-3 py-2 border-b border-gray-200"
              onPress={async () => {
                await useRecentSearch(term)
              }}
            >
              <Text>{term}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  )
}
export default SearchBar