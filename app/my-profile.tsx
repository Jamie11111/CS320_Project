import { View, Text, ScrollView, Pressable} from "react-native"
import "../global.css"
import Navbar from "../components/navbar"
import MyProfileBanner from "../components/my-profile-banner"
import FeedCard from "../components/feed-card"
import { useRouter } from "expo-router"
const MyProfilePage = () => {

  const router = useRouter()
  return (
    <View >
      <Navbar />
      <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/upload-product",
                    params: { isEditing: "false" },
                  })
                }
                className="absolute z-10 top-64 mt-6 right-4 bg-umass-red rounded-full px-5 py-3 shadow-lg"
      ><Text className="text-white text-2xl font-bold">+</Text></Pressable>
      <MyProfileBanner name="John Doe" location="Amherst, MA" email="johndoe@example.com" />
      <ScrollView >
        <View className="flex-row flex-wrap justify-center mb-48">
          <FeedCard isEditing={true}/>
          <FeedCard/>
          <FeedCard/>
          <FeedCard/>
          <FeedCard/>
          <FeedCard/>
          <FeedCard/>
          <FeedCard description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." />

        </View>
      </ScrollView>
    </View>
  )
}

export default MyProfilePage
