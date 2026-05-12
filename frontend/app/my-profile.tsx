import { View, Text, ScrollView, Pressable, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator} from "react-native"
import "../global.css"
import Navbar from "../components/navbar"
import MyProfileBanner from "../components/my-profile-banner"
import FeedCard from "../components/feed-card"
import { useRouter } from "expo-router"
import { useContext, useEffect, useState } from "react"
import React from "react"
import { fetchFromBackend, isSignedIn } from "../scripts/authFetch"
import { DataContext } from "../components/data-context";
import RedButton from "../components/red-button"
import * as SecureStore from 'expo-secure-store';

type ListingPhoto = {
  photoID?: number;
  photoURL: string;
  photoPath?: string;
};

const MyProfilePage = () => {
  type userData = {
    user_id: string
    name: string
    email: string
    address: string | null
    latitude: number | null
    longitude: number | null
    profile_picture_url: string | null
  }
  type Listing = {
  user_id: string
  listing_id: string
  product_name: string
  product_desc: string | null
  item_condition: string
  price: string
  sold: boolean
  photos: ListingPhoto[]
  // using API Listings (above) but actual listings (below) should have more dataa
  // id: number
  // name: string
  // price: number
  // location: string
  // description: string
  // condition: string
  // images: FeedImageSource[]
}
  const router = useRouter()
  const {cachedData, updateCache} = useContext(DataContext);
  const { profileData } = cachedData;
  const [listings, setListings] = useState<Listing[]>([])
  const [userData, setUserDataFn] = useState<userData | null>(profileData);
  const setUserData = (value: React.SetStateAction<userData | null>) => {
    setUserDataFn(value);
    updateCache("profileData", value);
  }
  const [userLocation, setUserLocation] = useState(userData?.address ?? "")
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  })
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const handleLocationUpdate = async (locationData: { address: string | null; latitude: number | null; longitude: number | null }) => {

  setUserLocation(locationData.address || "");
  {/* Update location */}
  if (userData) {
    setUserData({
      ...userData,
      address: locationData.address,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    });
  }

  try {
    const response = await fetchFromBackend('/api/user', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: locationData.address,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Server update failed:", errorData);
      Alert.alert("Sync Failed", "Could not save your new location to the server.");
    } else {
      console.log("Location synced successfully!");
    }
  } catch (error) {
    console.error("Network error during location sync:", error);
    Alert.alert("Sync Error", "Make sure your backend is running.");
  }
  };

const handlePfpUpdate = async (localUri: string) => {
  if (!userData) return;

  const oldUrl = userData.profile_picture_url;
  //shows the local image immediately
  setUserData({ ...userData, profile_picture_url: localUri });

  try {
    //Convert URI to blob for upload
    const photoBlob = await fetch(localUri).then(res => res.blob());
    const filename = `profile_${userData.user_id}_${Date.now()}.jpg`;

    //Upload to Supabase Storage 
    const uploadResponse = await fetchFromBackend('/api/account/photo-upload', {
      method: 'POST',
      headers: {
        'File-Metadata': JSON.stringify({ filename }),
      },
      body: photoBlob, 
    });

    if (!uploadResponse.ok) throw new Error("Storage upload failed");

    const { publicUrl, path } = await uploadResponse.json();
    //Update the users table with the permanent URL
    const response = await fetchFromBackend('/api/user', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profile_picture_url: publicUrl, 
      }),
    });


    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend Error:", errorData);
      throw new Error("Upload failed");
    }

    setUserData({ ...userData, profile_picture_url: publicUrl });
    console.log("PFP URL updated in database");

  } catch (error) {
    console.error("PFP update error:", error);
    Alert.alert("Error", "Could not save profile picture.");
    setUserData({ ...userData, profile_picture_url: oldUrl });
  }
};

const handlePasswordUpdate = async () => {
    // Password constraints 
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!passwordRegex.test(passwords.new)) {
      Alert.alert("Weak Password", "Must be 8+ chars with uppercase, lowercase, number, and special char.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
     const response = await fetchFromBackend('/api/account', {
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         password: passwords.new
       }),
     });


      if (response.ok) {
        Alert.alert("Success", "Password updated successfully.");
        setPasswordModalVisible(false);
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        const err = await response.json();
        Alert.alert("Error", err.message || "Failed to update password.");
      }
    } catch (error) {
      Alert.alert("Error", "Network error.");
    } finally {
      setPasswordLoading(false);
    }
  };

  //signout logic
 const handleSignOut = async () => {
  Alert.alert("Sign Out", "Are you sure you want to log out?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Log Out",
      style: "destructive",
      onPress: async () => {
        await Promise.all([
          SecureStore.deleteItemAsync('accessToken'),
          SecureStore.deleteItemAsync('refreshToken')
        ]);
        router.replace("/login");
      }
    }
  ]);
 };


  useEffect(() => {
{/* Obtain listings*/}
      const fetchListings = async () => {
        try {
          if(!await isSignedIn()){
            router.push("/login")
          }

          const userResponse = await fetchFromBackend('/api/user', {
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!userResponse.ok) {
            alert('Failed to get user information');
            return;
          } 

          const userData = await userResponse.json();
          setUserData(userData);  

          if (userData.address) {
            setUserLocation(userData.address);
          }

          const response = await fetchFromBackend(`/api/listings/user/${userData.user_id}`, {
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
                    console.log("Fetched listings data:", data);
          if(data.length === 0) {
            setListings([]);
            return;
          }
          const normalized = data.map((listing: any) => ({
            ...listing,
            photos: listing.photos.map((photo: any) => ({
                photoID: photo.photo_id,
                photoURL: photo.photo_url,
                photoPath: photo.photo_path,
            }))
          }));
          setListings(normalized);
        } catch (error) {
          console.error("Error fetching listings", error)
        }
      }
  
      fetchListings()
    }, [])

  
  return (
    <View>
      <View className="h-[92%]">
     
        <MyProfileBanner name={userData?.name || "Loading..."} location={userLocation} email={userData?.email || "johndoe@example.com"} onLocationChange={handleLocationUpdate} profilePictureUrl={userData?.profile_picture_url || null} onPfpChange={handlePfpUpdate} onEditPassword={() => setPasswordModalVisible(true)} onSignOut={handleSignOut}/>
        <ScrollView contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", marginLeft: 3}}>
          {listings.map((listing, index) => (
            <FeedCard
              key={index}
              name={listing.product_name}
              price={listing.price}
              location={userLocation}
              description={listing.product_desc ?? ""}
              condition={listing.item_condition}
              userId={listing.user_id}
              listingId={listing.listing_id}
              images={listing.photos}
              isEditing={true}
              sold={listing.sold}
            />
          ))}
        </ScrollView>
      </View>
      {/* Change password */}
     <Modal visible={isPasswordModalVisible} animationType="fade" transparent>
      <View className="flex-1 justify-center items-center bg-black/60 px-4">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="w-full"
        >
          <View className="bg-white rounded-3xl p-6 shadow-2xl">
            <Text className="text-black font-bold text-3xl mb-6">
              Change Password
            </Text>

            <View className="space-y-4">
              {[
                { label: "Current Password:", key: "current", show: showCurrent, setShow: setShowCurrent },
                { label: "New Password:", key: "new", show: showNew, setShow: setShowNew },
                { label: "Confirm New:", key: "confirm", show: showConfirm, setShow: setShowConfirm }
              ].map((item) => (
                <View key={item.key} className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-medium w-[40%] text-gray-800">
                    {item.label}
                  </Text>
                  <View className="bg-gray-300 rounded-lg w-[60%] flex-row items-center px-3">
                    <TextInput
                      className="flex-1 p-3 text-black"
                      secureTextEntry={!item.show}
                      placeholder="••••••••"
                      placeholderTextColor="#6a6b6b"
                      value={passwords[item.key as keyof typeof passwords]}
                      onChangeText={(t) => setPasswords({...passwords, [item.key]: t})}
                    />
                    <Pressable onPress={() => item.setShow(!item.show)}>
                      <Text className="text-umass-red font-bold text-[10px] uppercase">
                        {item.show ? "Hide" : "Show"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>

          <View className="items-center mt-8 w-full">
          {
          }
          <View className="items-center w-full">
            <RedButton 
              disabled={passwordLoading} 
              onPressFunction={handlePasswordUpdate} 
              text={passwordLoading ? "Loading..." : "Update Password"} 
            />
          </View>
          
          <Pressable 
            onPress={() => {
              setPasswordModalVisible(false);
              setPasswords({ current: "", new: "", confirm: "" });
            }}
            className="border-2 border-gray-300 rounded-xl p-3 items-center w-52"
          >
            <Text className="text-gray-500 font-bold uppercase tracking-widest text-xs">
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>

      <Navbar canNavigate={userLocation.trim() !== ""} userPfp={userData?.profile_picture_url || null} />
    </View>
  )
}

export default MyProfilePage
