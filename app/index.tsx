import { StyleSheet, Text, View, Image, TextInput, Pressable } from 'react-native'
import "../global.css"
import { storage } from '../lib/firebase'
import {useEffect} from 'react'
import Navbar from '../components/navbar'
import FeedCard from '../components/feed-card'
import { ScrollView } from 'react-native'
import UploadProductPage from './upload-product'

const Home = () => {
  return (
    <View>
      <Navbar />
      <ScrollView>
        <View className="flex-row flex-wrap justify-center mb-16">
          <FeedCard description = "aefneoifnaiweufnaoiwefaoiwuhefiaowehfiauwehfiawedoiajfoawejfpaowiejfoawiefjaopwefowhuefoiahuwefioauhwefoiauwhefioahwefiuawefnawiefaiuwefhaiwuehfiawuhefoiahuwefiahuwefuiuawheifohawioehfaioweuhfiaawefjaopwejifapowiejfpoaijwefopaiwejfoawjefopjawoepfjaoweijawoefijawefopjiaweopfjawpoejfaopweijfaoiwjefpoawjiefpoijawefpoijaoweijfaowefjiapwoejfapwoefjwefjoeawoifjawopefjawoefawefapweoifjapowejifopawijefoajweopfjawpjeffopaiwjefpoiawjeofjawoejfoawiejfpoaiwjefpoajwepfjapwjiefpawjefoaijwefoawjefpaiwjefopajpweifjapoewjifawpefjawoejfawoepfjaowejfawepfawefuwhefiauwhefioauhwefouhawehfaoiuwehfoaiuwhefoiahuweufioahwieofuhaweoifuhaoiwuehfaoiwuehfoaiwehufiauwhefoiawehfaewhaweifhaoiwhef" />
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


