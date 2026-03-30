import { StyleSheet, Text, View, Image, TextInput, Pressable } from 'react-native'
import "../global.css"
import { storage } from '../lib/firebase'
import {useEffect} from 'react'
import Navbar from '../components/navbar'
import FeedCard from '../components/feed-card'
import { ScrollView } from 'react-native'
import UploadProductPage from './upload-product'
import { useRouter } from 'expo-router'
import couch1 from "../assets/images/couch1.jpg"
import couch2 from "../assets/images/couch2.webp"
const Home = () => {
  const router = useRouter()
  return (
    <View>
      <Navbar />
      <Pressable
          onPress={() =>
            router.push({
              pathname: "/upload-product",
              params: { isEditing: "false" },
            })
          }
          className="absolute z-10 top-20 right-4 bg-umass-red rounded-full px-5 py-3 shadow-lg"
        >
          <Text className="text-white text-2xl font-bold">+</Text>
      </Pressable>
      <ScrollView>
        <View className="flex-row flex-wrap justify-center mb-16">
          <FeedCard images={[couch1, couch2]} title="Leather Couch" location="Amherst, MA" price="$200"
          description = "Large leather couch. Decent condition. One cushion is slightly torn and there are scratch marks on the back because of my cat." />
          <FeedCard/>
          <FeedCard/>
          <FeedCard/>
          <FeedCard/>
          <FeedCard/>
          <FeedCard/>
          <FeedCard/>
        </View>
      </ScrollView>
    </View>
  )
}

export default Home


