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
  onFilterPress: () => void;
  hideHistory?: boolean;

}

const SearchBar = ({ value, onChangeText, onSubmitSearch,  onFilterPress, hideHistory}: SearchBarProps) => {
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
  if (hideHistory) {
    setShowHistory(false);
  }
}, [hideHistory]);
  useEffect(() => {
    if (!isFocused) {
      setClicked(false);
      setShowHistory(false);
    } 
  }, [isFocused])

  return (
    <View className="w-full flex-row items-center px-4 py-3 z-50">
    <View className="flex-1 relative">
      <Pressable onPress={() => setClicked(true)} className="bg-umass-red h-11 rounded-lg shadow-md flex-row items-center px-3">
        {!clicked && <Image source={search} className="w-5 h-5 mr-2" 
      style={{ tintColor: 'white' }}/>}
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
          className="flex-1 h-10 text-white"
          placeholder="Search listings"
          placeholderTextColor={"rgba(255, 255, 255, 0.7)"}
        />
      </Pressable>

      {showHistory && !hideHistory && recentSearches.length > 0 && (
        <View className="absolute top-12 left-0 right-0 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden"
           style={{ zIndex: 1000 }}>
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
     <Pressable onPress={onFilterPress} className="ml-4 h-11 justify-center items-center">
       <View className="w-6 h-0.5 bg-umass-red mb-1" />
       <View className="w-6 h-0.5 bg-umass-red mb-1" />
       <View className="w-6 h-0.5 bg-umass-red" />
     </Pressable>
    </View>
  )
}
export default SearchBar