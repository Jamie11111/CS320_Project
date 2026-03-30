import { View, Text, TextInput, Pressable, KeyboardAvoidingView, ScrollView, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { useState } from "react"
import "../global.css"

const LoginScreen = () => {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      router.push("/")
    }, 1000)
  }

  return (
    <View className="flex-1 bg-umass-red">
      <KeyboardAvoidingView className="bg-umass-red flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          className="px-8 py-12"
          scrollEnabled={false}
        >
          <View className="bg-white w-full py-4 rounded-xl mb-12">
            <Text className="text-center text-4xl font-black text-umass-red uppercase">UMarket</Text>
          </View>

          <View className="mb-6">
            <Text className="text-white font-bold text-2xl mb-2">UMass Email Address</Text>
            <TextInput
              className="bg-white h-16 rounded-2xl px-4 text-xl"
              placeholder="@umass.edu"
              placeholderTextColor="#666"
              textAlign="left"
              autoCapitalize="none"
            />
          </View>

          <View className="mb-12">
            <Text className="text-white font-bold text-2xl mb-2">Password</Text>
            <View className="bg-white h-16 rounded-2xl px-4 flex-row items-center">
              <TextInput
                className="flex-1 text-xl font-bold"
                secureTextEntry={!showPass}
                placeholder=""
              />
              <Pressable onPress={() => setShowPass(!showPass)}>
                <Text className="text-gray-600 font-bold">{showPass ? "Hide" : "Show"}</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={handleLogin}
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