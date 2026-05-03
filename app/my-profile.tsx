import { View, Text, ScrollView, Pressable, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator} from "react-native"
import "../global.css"
import Navbar from "../components/navbar"
import MyProfileBanner from "../components/my-profile-banner"
import FeedCard from "../components/feed-card"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import React from "react"
import { fetchWithAuth } from "../scripts/authFetch"

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
  const [userLocation, setUserLocation] = useState("Amherst, MA")
  const [listings, setListings] = useState<Listing[]>([])
  const [userData, setUserData] = useState<userData | null>(null)
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
    const response = await fetchWithAuth('http://localhost:3000/api/user', {
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
    const uploadResponse = await fetchWithAuth('http://localhost:3000/api/account/photo-upload', {
      method: 'POST',
      headers: {
        'File-Metadata': JSON.stringify({ filename }),
      },
      body: photoBlob, 
    });

    if (!uploadResponse.ok) throw new Error("Storage upload failed");

    const { publicUrl, path } = await uploadResponse.json();
    //Update the users table with the permanent URL
    const response = await fetchWithAuth('http://localhost:3000/api/user', {
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
      const response = await fetchWithAuth('http://localhost:3000/api/user/password-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new
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

  useEffect(() => {
{/* Obtain listings*/}
      const fetchListings = async () => {
        try {
          const userResponse = await fetchWithAuth('http://localhost:3000/api/user', {
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

          const response = await fetchWithAuth(`http://localhost:3000/api/listings/user/${userData.user_id}`, {
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
     
        <MyProfileBanner name={userData?.name || "John Doe"} location={userLocation} email={userData?.email || "johndoe@example.com"} onLocationChange={handleLocationUpdate} profilePictureUrl={userData?.profile_picture_url || null} onPfpChange={handlePfpUpdate} onEditPassword={() => setPasswordModalVisible(true)}/>
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
      <Modal visible={isPasswordModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50"> 
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View className="bg-white rounded-t-[40px] p-8 pb-12 shadow-2xl">
              
              <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-6" />

              <Text className="text-3xl font-black text-umass-red mb-2 uppercase tracking-tighter">
                Update Security
              </Text>
              <Text className="text-gray-500 font-medium mb-8">
                Ensure your new password is  8+ chars with uppercase, lowercase, number, and special character.
              </Text>
              
              {/* Current Password */}
              <View className="mb-5">
                <Text className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1.5 tracking-widest">Current Password</Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-100 h-16 rounded-2xl px-5 focus:border-umass-red">
                  <TextInput 
                    className="flex-1 h-full text-gray-800 font-semibold"
                    secureTextEntry={!showCurrent}
                    placeholder="••••••••"
                    placeholderTextColor="#9ca3af"
                    value={passwords.current}
                    onChangeText={(t) => setPasswords({...passwords, current: t})}
                  />
                  <Pressable onPress={() => setShowCurrent(!showCurrent)} className="ml-2 py-2 px-1">
                    <Text className="text-umass-red font-bold text-[10px] uppercase tracking-tighter">
                      {showCurrent ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* New Password */}
              <View className="mb-5">
                <Text className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1.5 tracking-widest">New Password</Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-100 h-16 rounded-2xl px-5">
                  <TextInput 
                    className="flex-1 h-full text-gray-800 font-semibold"
                    secureTextEntry={!showNew}
                    placeholder="••••••••"
                    placeholderTextColor="#9ca3af"
                    value={passwords.new}
                    onChangeText={(t) => setPasswords({...passwords, new: t})}
                  />
                  <Pressable onPress={() => setShowNew(!showNew)} className="ml-2 py-2 px-1">
                    <Text className="text-umass-red font-bold text-[10px] uppercase tracking-tighter">
                      {showNew ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Confirm Password */}
              <View className="mb-8">
                <Text className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1.5 tracking-widest">Confirm Password</Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-100 h-16 rounded-2xl px-5">
                  <TextInput 
                    className="flex-1 h-full text-gray-800 font-semibold"
                    secureTextEntry={!showConfirm}
                    placeholder="Repeat new password"
                    placeholderTextColor="#9ca3af"
                    value={passwords.confirm}
                    onChangeText={(t) => setPasswords({...passwords, confirm: t})}
                  />
                  <Pressable onPress={() => setShowConfirm(!showConfirm)} className="ml-2 py-2 px-1">
                    <Text className="text-umass-red font-bold text-[10px] uppercase tracking-tighter">
                      {showConfirm ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row space-x-4">
                <Pressable 
                  onPress={() => setPasswordModalVisible(false)}
                  className="flex-1 h-16 bg-gray-100 rounded-2xl justify-center items-center active:bg-gray-200"
                >
                  <Text className="font-black text-gray-500 uppercase tracking-widest text-xs">Cancel</Text>
                </Pressable>
                <Pressable 
                  onPress={handlePasswordUpdate}
                  disabled={passwordLoading}
                  className="flex-[2] h-16 bg-umass-red rounded-2xl justify-center items-center shadow-lg shadow-red-200 active:opacity-90"
                >
                  {passwordLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="font-black text-white uppercase tracking-widest text-xs">Update Password</Text>
                  )}
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
