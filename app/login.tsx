import { View, Text, TextInput, Pressable, KeyboardAvoidingView, ScrollView, ActivityIndicator, Alert, Image, Platform } from "react-native"
import { useRouter } from "expo-router"
import { useState } from "react"
import "../global.css"
import * as SecureStore from 'expo-secure-store';
import { fetchWithAuth } from "../scripts/authFetch"
import React from "react";
import Home from "./main-feed";
import Logo from "../assets/images/Logo.png"
const LoginScreen = () => {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    try {
      if (!email || !password) {
       Alert.alert("Error", "Please enter both email and password.");
       return;
      }


      setLoading(true);      
      const response = await fetch('http://localhost:3000/api/account/login', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      },
      body: JSON.stringify({
          email: email,
          password: password,
      })
      });

      console.log("Response status:", response.status)

      const responseJson: any = await response.json();
      
      console.log("Response JSON:", responseJson);  

      if (response.ok) {
            const { session } = responseJson;
            //stores tokens
            if (session && session.accessToken) {
              await SecureStore.setItemAsync("accessToken", session.accessToken);
              await SecureStore.setItemAsync("refreshToken", session.refreshToken);
              router.push("main-feed");
            } else {
              Alert.alert("Login Error", "Session data was missing from server.");
            }
          } else { //error check password and email
            Alert.alert("Login Failed", responseJson.error || "Invalid email or password.");
            setLoading(false); // Stop loading so user can try again
          }

        } catch (error) {
          console.error("Login error", error);
          Alert.alert("Error", "A network error occurred. Please try again.");
          setLoading(false); 
        }
//     Once logged in, you should include the following line in all your fetch request headers:
// 'Authorization': `Bearer ${accessToken} ${refreshToken}`

// Additionally, all responses that the server sends to signed-in users will include the following in the header:
// "Session-Tokens": `${session.access_token} ${session.refresh_token}`You should periodically update the locally stored accessToken and refreshToken using these values, since the tokens will expire after some time. But it's not super important for now
  }

  return (
    <View className="flex-1 bg-umass-red">
      <KeyboardAvoidingView className="bg-umass-red flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          className="px-8 pb-12"
          scrollEnabled={false}
        >
        {/* Logo */}
         <View className="flex-row items-center justify-center mb-10">
           <Text
             className="text-white font-black uppercase"
             style={{
               fontSize: 48,
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
               className="w-16 h-16"
               resizeMode="contain"
             />
           </View>


           <Text
             className="text-white font-black uppercase"
             style={{
               fontSize: 48,
               textShadowColor: '#000',
               textShadowOffset: { width: 1, height: 1 },
               textShadowRadius: 1,
               fontFamily: Platform.OS === 'ios' ? 'Georgia-Bold' : 'serif'
             }}
           >
             ARKET
           </Text>
         </View>

{/* Email */}
          <View className="mb-6">
            <Text className="text-white font-bold text-2xl mb-2">UMass Email Address</Text>
            <TextInput
              className="bg-white h-16 rounded-2xl px-4 text-xl"
              placeholder="@umass.edu"
              placeholderTextColor="#666"
              textAlign="left"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

{/*Password */}
          <View className="mb-12">
            <Text className="text-white font-bold text-2xl mb-2">Password</Text>
            <View className="bg-white h-16 rounded-2xl px-4 flex-row items-center">
              <TextInput
                className="flex-1 text-xl font-bold"
                secureTextEntry={!showPass}
                placeholder=""
                value={password}
                onChangeText={setPassword}
                textContentType="oneTimeCode"
              />
              <Pressable onPress={() => setShowPass(!showPass)}>
                <Text className="text-gray-600 font-bold">{showPass ? "Hide" : "Show"}</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={() => handleLogin()}
            className="bg-white w-full py-4 rounded-[30px] h-20 justify-center active:bg-gray-200 mb-8"
          >
            {loading ? (
              <ActivityIndicator color="#881C1C" size="large" />
            ) : (
              <Text className="text-center text-4xl font-bold">Login</Text>
            )}
          </Pressable>

          <Pressable onPress={() => router.push("/signup")} className="self-center">
            <Text className="text-white font-bold text-xl underline">Create Account</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <View className="bg-umass-red h-24 z-[-1] absolute bottom-[-40px] w-full" />
    </View>
  )
}

export default LoginScreen