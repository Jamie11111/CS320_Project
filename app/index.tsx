import { StyleSheet, Text, View, Image } from 'react-native'
import "../global.css"
import { storage } from '../lib/firebase'
import {useEffect} from 'react'
import Navbar from '../components/navbar'
import FeedCard from '../components/feed-card'
import { ScrollView } from 'react-native'

const Home = () => {
  return (
    <View>
      <Navbar />
      <ScrollView>
        <View className="flex-row flex-wrap justify-center">
          <FeedCard title = "test" />
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



