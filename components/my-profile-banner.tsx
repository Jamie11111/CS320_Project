import "../global.css"
import { View, Text, Pressable , TextInput} from "react-native"
import { useRouter } from "expo-router"
import { useState } from "react"

interface MyProfileBannerProps {
    name: string
    location: string
    email:string 
    onLocationChange: (loc: string) => void
}

const MyProfileBanner = ({ name, location, email, onLocationChange }: MyProfileBannerProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [inputValue, setInputValue] = useState(location)
  
  const LOCATION_IQ_KEY = "pk.ff54db5bc5b50127d459385769a878a5" 

  const handleSuggestionSelect = (selectedName: string) => {
    setInputValue(selectedName);
  
    setSuggestions([]);
  
    onLocationChange(selectedName);
  };

  const handleSearch = async (text: string) => {
    setInputValue(text)
    
    if (text.length === 0) {
      onLocationChange("")
      setSuggestions([])
      return
    }

    if (text.length < 3) {
      setSuggestions([])
      return
    }

    const url = `https://api.locationiq.com/v1/autocomplete?key=${LOCATION_IQ_KEY}&q=${encodeURIComponent(text)}&limit=5&dedupe=1`

    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setSuggestions(data)
      } else {
        setSuggestions([])
      }
    } catch (error) {
      console.error("LocationIQ Error:", error)
    }
  }
  return (
    <View>

      <View className="px-4 pt-4 pb-3 bg-white flex-row">
        <View>
          <View className="bg-gray-200 shadow-sm w-28 h-28 rounded-full ml-2" />
          <Pressable className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2">
            <Text className="text-white text-xs font-bold">Edit</Text>
          </Pressable>
        </View>
        <View className="ml-5 mt-3 flex-1">
            <Text className="text-xl font-bold">Name: {name}</Text>
            <View className="flex-row">
              <Text className="text-lg font-medium">Email: {email}</Text>
            </View>
            <View className="flex-row">
              <Text className="text-lg font-medium mt-1">Location: </Text>
              <TextInput 
                className="bg-gray-300 rounded-lg w-[50%] p-2 overflow-y-scroll" 
                defaultValue={location}
                placeholder="Enter"
                maxLength={50}
                onChangeText={handleSearch}
              />

              {suggestions.length > 0 && (
              <View className="absolute top-16 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-2xl z-[100]">
                {suggestions.map((item, index) => (
                  <Pressable
                    key={index}
                    className="p-3 border-b border-gray-100 active:bg-gray-100"
                    onPress={() => {
                      handleSuggestionSelect(item.display_name)
                    }}
                  >
                    <Text numberOfLines={1} className="text-[10px] font-medium text-gray-700">
                      {item.display_name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
            </View>
        </View>
      </View>
    <Text className="text-black text-3xl font-bold m-4 mb-1">Your Products</Text>
    </View>
  )
}
export default MyProfileBanner