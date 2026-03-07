import { StyleSheet, Text, View, Image } from 'react-native'
import "../global.css"
import { storage } from '../lib/firebase'
import {useEffect} from 'react'
const Home = () => {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-xl">Welcome to UMarket!</Text>
    </View>
  )
}

export default Home

const styles = StyleSheet.create({})

