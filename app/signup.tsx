import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native"
import { useRouter } from "expo-router"
import { useState } from "react"
import "../global.css"

const SignUpScreen = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  const handleSignUp = () => {
    const umassRegex = /^[a-zA-Z0-9._%+-]+@umass\.edu$/
    if (!umassRegex.test(email)) {
      Alert.alert("UMass Only", "Please use a valid @umass.edu email address.")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.")
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      router.push("/my-profile") 
    }, 1500)
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-umass-red"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} 
        className="px-8 py-12"
      >
        
        <View className="bg-gray-300 w-full py-4 rounded-xl border-2 border-black mb-10">
          <Text className="text-center text-4xl font-black text-umass-red uppercase italic">UMarket</Text>
        </View>

        <View className="mb-4">
          <Text className="text-white font-black text-2xl mb-2 italic">Name</Text>
          <TextInput 
            className="bg-gray-300 h-16 rounded-2xl px-4 border-2 border-black text-xl font-bold"
            placeholder=""
            placeholderTextColor="#666"
            textAlign="left"
          />
        </View>

        <View className="mb-4">
          <Text className="text-white font-black text-2xl mb-2 italic">UMass Email Address</Text>
          <TextInput 
            className="bg-gray-300 h-16 rounded-2xl px-4 border-2 border-black text-xl font-bold"
            placeholder="@umass.edu"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            textAlign="right"
          />
        </View>

        
        <View className="mb-4">
          <Text className="text-white font-black text-2xl mb-2 italic">Password</Text>
          <View className="bg-gray-300 h-16 rounded-2xl px-4 border-2 border-black flex-row items-center">
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
          <Text className="text-white font-black text-2xl mb-2 italic">Confirm Password</Text>
          <View className="bg-gray-300 h-16 rounded-2xl px-4 border-2 border-black flex-row items-center">
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
          className="bg-white w-full py-4 rounded-[30px] border-2 border-black h-20 justify-center active:bg-gray-200"
        >
          {loading ? (
            <ActivityIndicator color="#881C1C" size="large" />
          ) : (
            <Text className="text-center text-4xl font-black italic">Sign Up</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push("/login")} className="mt-6 self-center">
          <Text className="text-white font-bold text-lg underline italic">Back to Login</Text>
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default SignUpScreen