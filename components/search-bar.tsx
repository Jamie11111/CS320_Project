import "../global.css"
import { View, Text, Pressable, TextInput, Image } from "react-native"
import React, { useState } from "react"
import search from "../assets/images/search.png"
import { SearchHistoryManager } from "../routes/searchHistory"

type SearchBarProps = {
  value: string
  onChangeText: (text: string) => void
  onSubmitSearch: (query: string) => Promise<void> | void
}

const SearchBar = ({ value, onChangeText, onSubmitSearch }: SearchBarProps) => {
  const [clicked, setClicked] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)

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
          placeholder="Search listings"
          className="h-10 pl-4"
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