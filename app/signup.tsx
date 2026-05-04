import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image } from "react-native"
import { useRouter } from "expo-router"
import { useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as SecureStore from 'expo-secure-store';
import "../global.css"
import React from "react"
import { fetchFromBackend } from "../scripts/authFetch"
import Logo from "../assets/images/Logo.png"

const SignUpScreen = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [locationText, setLocationText] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [coordinates, setCoordinates] = useState({ lat: null as number | null, lon: null as number | null })
  const [isEditingLocation, setIsEditingLocation] = useState(true);

  
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  const LOCATION_IQ_KEY = "pk.ff54db5bc5b50127d459385769a878a5"


  const handleLocationSearch = async (text: string) => {
   setLocationText(text)
   if (text.length < 3) {
     setSuggestions([])
     return
   }


   const url = `https://api.locationiq.com/v1/autocomplete?key=${LOCATION_IQ_KEY}&q=${encodeURIComponent(text)}&limit=5&dedupe=1&lat=42.3601&lon=-71.0589&countrycodes=us`;
   try {
     const response = await fetch(url)
     const data = await response.json()
     if (Array.isArray(data)) {
       setSuggestions(data)
     }
   } catch (error) {
     console.error("Location Search Error:", error)
   }
  }
//sets location
  const handleSelectLocation = (item: any) => {
   setLocationText(item.display_name);
   setCoordinates({ lat: parseFloat(item.lat), lon: parseFloat(item.lon) });
   setSuggestions([]);
   setIsEditingLocation(false);
  };


  const handleSignUp = async () => {
    //@umass.edu check
    const umassRegex = /^[a-zA-Z0-9._%+-]+@umass\.edu$/
    if (!umassRegex.test(email)) {
      Alert.alert("UMass Only", "Please use a valid @umass.edu email address.")
      return
    }

    //password constraints
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&)."
      )
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.")
      return
    }
    try {
      const response = await fetchFromBackend('/api/account/signup', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      },
      body: JSON.stringify({
          email: email,
          password: password,
          name: name,
      })
      }, false);

   const responseJson: any = await response.json();
   console.log("Signup Response status:", response.status);


   if (!response.ok) {
     Alert.alert("Sign Up Failed", responseJson.error || "Could not create account.");
     setLoading(false);
     return;
   }


   const { session } = responseJson;


   if (session) {
     //Save tokens 
    //  await SecureStore.setItemAsync("accessToken", session.accessToken);
    //  await SecureStore.setItemAsync("refreshToken", session.refreshToken);
    
    //  console.log("Tokens saved. Attempting location update...");


     // Update User Location
     const locationResponse = await fetchFromBackend('/api/user', {
       method: 'PATCH',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         address: locationText,
         latitude: coordinates.lat,
         longitude: coordinates.lon,
       }),
     });


     if (!locationResponse.ok) {
       const errorData = await locationResponse.json();
       console.error("Location update failed:", errorData);
       Alert.alert("Account created, but could not save your location.");
       router.push("/login");
     } else {
       console.log("Location synced successfully!");
       router.push("/login");
     }
   } else {
     console.error("Signup failed: No session returned", responseJson.message);
     Alert.alert("Error", "Session could not be established.");
   }

    } catch (error) {
      console.error("Login error", error)
    }

    
  }

  return (
    <View className="flex-1 bg-umass-red ">
      <View className="bg-umass-red flex-1">
      
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} 
          className="px-8 py-12"
          scrollEnabled={false}
        >
        {/* Logo */}
         <View className="flex-row items-center justify-center mt-2 mb-4">
           <Text
             className="text-white font-black uppercase"
             style={{
               fontSize: 42,
               textShadowColor: '#000',
               textShadowOffset: { width: 1, height: 1 },
               textShadowRadius: 1,
               fontFamily: Platform.OS === 'ios' ? 'Georgia-Bold' : 'serif'
             }}
           >
             U
           </Text>


           <View className="mx-1">
             <Image
               source={Logo}
               className="w-14 h-14"
               resizeMode="contain"
             />
           </View>


           <Text
             className="text-white font-black uppercase"
             style={{
               fontSize: 42,
               textShadowColor: '#000',
               textShadowOffset: { width: 1, height: 1 },
               textShadowRadius: 1,
               fontFamily: Platform.OS === 'ios' ? 'Georgia-Bold' : 'serif'
             }}
           >
             ARKET
           </Text>
         </View>

          <View className="mb-4">
            <Text className="text-white font-bold text-2xl mb-2">Name</Text>
            <TextInput 
              className="bg-white h-16 rounded-2xl px-4 text-xl "
              placeholder=""
              placeholderTextColor="#666"
              textAlign="left"
              value={name}
              onChangeText={setName}
            />
          </View>
{/* location */}
          <View className="mb-4 z-50">
           <Text className="text-white font-bold text-xl mb-2">Location</Text>
           <View className="bg-white h-16 rounded-2xl px-4 overflow-hidden justify-center">
             {!isEditingLocation ? (
               <Pressable
                 onPress={() => setIsEditingLocation(true)}
                 className="w-full h-full justify-center"
               >
                 <Text
                   numberOfLines={1}
                   ellipsizeMode="tail"
                   className="text-xl text-black"
                 >
                   {locationText}
                 </Text>
               </Pressable>
             ) : (
               <TextInput
                 className="text-xl h-full"
                 placeholder="Search address..."
                 placeholderTextColor="#666"
                 value={locationText}
                 onChangeText={handleLocationSearch}
                 autoFocus={locationText.length > 0}
                 multiline={false}
                 numberOfLines={1}
               />
             )}
           </View>


           {suggestions.length > 0 && (
             <View className="absolute top-24 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] overflow-hidden">
               {suggestions.map((item, index) => (
                 <Pressable
                   key={index}
                   className="p-4 border-b border-gray-50 active:bg-gray-100"
                   onPress={() => handleSelectLocation(item)}
                 >
                   <Text numberOfLines={1} className="text-sm font-medium text-gray-700">
                     {item.display_name}
                   </Text>
                 </Pressable>
               ))}
             </View>
           )}
         </View>
{/* Email */}
          <View className="mb-4">
            <Text className="text-white font-bold text-2xl mb-2 ">UMass Email Address</Text>
            <TextInput 
              className="bg-white h-16 rounded-2xl px-4 text-xl"
              placeholder="@umass.edu"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              textAlign="left"
            />
          </View>

          {/* Password*/}
          <View className="mb-4">
            <Text className="text-white font-bold text-2xl mb-2 ">Password</Text>
            <Text className="text-white/80 text-xs mb-2 italic">
              Min 8 characters: 1 Upper, 1 Lower, 1 Number, 1 Special (@$!%*?&)
            </Text>
            <View className="bg-white h-16 rounded-2xl px-4 flex-row items-center">
              <TextInput 
                className="flex-1 text-xl font-bold"
                secureTextEntry={!showPass}
                placeholder=""
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                textAlign="left"
                textContentType="oneTimeCode"
                autoCorrect={false}
              />
              <Pressable onPress={() => setShowPass(!showPass)}>
                <Text className="text-gray-600 font-bold">{showPass ? "Hide" : "Show"}</Text>
              </Pressable>
            </View>
          </View>

          {/* Confirm Password */}
         <View className="mb-2">
           <Text className="text-white font-bold text-xl mb-1">Confirm Password</Text>
           <View className="bg-white h-14 rounded-2xl px-4 flex-row items-center">
             <TextInput
               className="flex-1 text-lg font-bold"
               secureTextEntry={!showConfirmPass}
               value={confirmPassword}
               onChangeText={setConfirmPassword}
               textContentType="oneTimeCode"
               autoCorrect={false}
             />
             <Pressable onPress={() => setShowConfirmPass(!showConfirmPass)}>
               <Text className="text-gray-600 font-bold">{showConfirmPass ? "Hide" : "Show"}</Text>
             </Pressable>
           </View>
         </View>

          
          <Pressable 
            onPress={handleSignUp}
            className="bg-white w-full py-4 rounded-[30px] h-20 mt-4 justify-center active:bg-gray-200"
          >
            {loading ? (
              <ActivityIndicator color="#881C1C" size="large" />
            ) : (
              <Text className="text-center text-4xl font-bold ">Sign Up</Text>
            )}
          </Pressable>

          <Pressable onPress={() => router.push("/login")} className="mt-6 bottom self-center ">
            <Text className="text-white  text-lg underline ">Back to Login</Text>
          </Pressable> 
        </ScrollView>
      </View>
      <View className="bg-umass-red h-24 z-[-1] absolute bottom-[-40px] w-full" />
    </View>
  )
}

export default SignUpScreen