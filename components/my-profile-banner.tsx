import "../global.css"
import { View, Text, Pressable , TextInput, Image, Alert, ActivityIndicator} from "react-native"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import React from "react"
import samplepfp from "../assets/images/samplepfp.png"
import * as ImagePicker from 'expo-image-picker';

interface MyProfileBannerProps {
    name: string
    location: string
    email:string 
    onLocationChange: (loc: { address?: string | null; 
                              latitude?: number | null; 
                              longitude?: number | null; }) => void
    profilePictureUrl: string | null;
    onPfpChange: (uri: string) => Promise<void>;
    onEditPassword: () => void;
}

const MyProfileBanner = ({ name, location, email, onLocationChange, profilePictureUrl, onPfpChange, onEditPassword }: MyProfileBannerProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [inputValue, setInputValue] = useState(location)
  const [isEditing, setIsEditing] = useState(false)
  
  const LOCATION_IQ_KEY = "pk.ff54db5bc5b50127d459385769a878a5" 
  const [isUploading, setIsUploading] = useState(false);

  const handleEditPfp = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photos to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setIsUploading(true);
      await onPfpChange(result.assets[0].uri);
      setIsUploading(false);
    }
  };

  const handleSuggestionSelect = (item: any) => {
    const selectedName = item.display_name;
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
  
    setInputValue(selectedName);
    setSuggestions([]);
  
    onLocationChange({
      address: selectedName,
      latitude: lat,
    longitude: lon
    });
  };

  const handleSearch = async (text: string) => {
    const MA_LAT = 42.3601;
    const MA_LON = -71.0589;
    setInputValue(text)
    
    if (text.length === 0) {
      onLocationChange({ address: null, latitude: null, longitude: null });
      setSuggestions([]);
      return;
    }

    if (text.length < 3) {
      setSuggestions([])
      return
    }

    const url = `https://api.locationiq.com/v1/autocomplete?key=${LOCATION_IQ_KEY}&q=${encodeURIComponent(text)}&limit=5&dedupe=1&lat=${MA_LAT}&lon=${MA_LON}&countrycodes=us`;
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
  useEffect(() => {
    setInputValue(location);
  }, [location]);
  return (
    <View>

      <View className="px-4 pt-4 pb-3 bg-white flex-row justify-between items-center sticky ml-6">
        <View>
          <Image source={profilePictureUrl ? { uri: profilePictureUrl } : samplepfp} className={`bg-gray-200 w-20 h-20 rounded-full ${isUploading ? 'opacity-50' : ''}`}></Image>
          <Pressable className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2"
            onPress={handleEditPfp}>
            <Text className="text-white text-xs font-bold">Edit</Text>
          </Pressable>
        </View>
        <View className="ml-5 mt-3 flex-1 flex-col">
            <Text className="text-xl font-bold">Name: {name}</Text>
            <View className="flex-row">
              <Text className="text-lg font-medium">Email: {email}</Text>
            </View>
            <View className="flex-row">
              <Text className="text-lg font-medium mt-1">Location: </Text>
              <TextInput 
                className="bg-gray-300 rounded-lg w-[50%] p-2 overflow-y-scroll" 
                defaultValue={inputValue}
                placeholder="Enter"
                placeholderTextColor={"#6a6b6b"}
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
                      handleSuggestionSelect(item)
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
            <Pressable 
              onPress={onEditPassword}
              className="mt-3 bg-white border border-gray-200 py-2 px-4 rounded-xl self-start active:bg-gray-50"
            >
              <Text className="text-gray-600 text-xs font-bold uppercase">Change Password</Text>
            </Pressable>
        </View>
      </View>
    <Text className="text-black text-3xl font-bold m-4 mb-1">Your Products</Text>
    </View>
  )
}
export default MyProfileBanner