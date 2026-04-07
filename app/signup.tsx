import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native"
import { useRouter } from "expo-router"
import { useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import "../global.css"

const SignUpScreen = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  const handleSignUp = async () => {
    const umassRegex = /^[a-zA-Z0-9._%+-]+@umass\.edu$/
    if (!umassRegex.test(email)) {
      Alert.alert("UMass Only", "Please use a valid @umass.edu email address.")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.")
      return
    }
    try {
      const response = await fetch('http://localhost:3000/api/account/signup', {
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
      });

      console.log("Response status:", response.status)

      const responseJson: any = await response.json();
      
      console.log("Response JSON:", responseJson);  

  
      const { session } = responseJson;
      await AsyncStorage.setItem("access_token", session.accessToken);
      await AsyncStorage.setItem("refresh_token", session.refreshToken);
      if (session.accessToken) {
        router.push("/")
      }
      else {
        console.error("Login failed:", responseJson.message)
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
          
          <View className="bg-white w-full py-4 rounded-xl mb-4">
            <Text className="text-center text-4xl font-black text-umass-red uppercase">UMarket</Text>
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

          
          <View className="mb-4">
            <Text className="text-white font-bold text-2xl mb-2 ">Password</Text>
            <View className="bg-white h-16 rounded-2xl px-4 flex-row items-center">
              <TextInput 
                className="flex-1 text-xl font-bold"
                secureTextEntry={!showPass}
                placeholder=""
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                textAlign="left"
              />
              <Pressable onPress={() => setShowPass(!showPass)}>
                <Text className="text-gray-600 font-bold">{showPass ? "Hide" : "Show"}</Text>
              </Pressable>
            </View>
          </View>

          
          <View className="mb-8">
            <Text className="text-white font-bold text-2xl mb-2 ">Confirm Password</Text>
            <View className="bg-white h-16 rounded-2xl px-4 flex-row items-center">
              <TextInput 
                className="flex-1 text-xl font-bold"
                secureTextEntry={!showConfirmPass}
                placeholder=""
                placeholderTextColor="#666"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                textAlign="left"
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