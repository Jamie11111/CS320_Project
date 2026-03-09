import { StyleSheet, Text, View, Image } from 'react-native'
import "../global.css"
import { storage } from '../lib/firebase'
import {useEffect} from 'react'
import Navbar from '../components/navbar'
import FeedCard from '../components/feed-card'
const Home = () => {
  return (
    <View >
      <Navbar />
      <View className="flex-row flex-wrap">
        <FeedCard/>
        <FeedCard/>
        <FeedCard/>
        <FeedCard/>
        <FeedCard/>
        <FeedCard/>
        <FeedCard/>
        <FeedCard/>
      </View>
    </View>
  )
}

export default Home



