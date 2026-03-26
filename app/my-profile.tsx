import { View, Text, ScrollView } from "react-native"
import "../global.css"
import Navbar from "../components/navbar"
import MyProfileBanner from "../components/my-profile-banner"
import FeedCard from "../components/feed-card"
const MyProfilePage = () => {

  return (
    <View >
      <Navbar />
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
          <FeedCard description = "aefneoifnaiweufnaoiwefaoiwuhefiaowehfiauwehfiawedoiajfoawejfpaowiejfoawiefjaopwefowhuefoiahuwefioauhwefoiauwhefioahwefiuawefnawiefaiuwefhaiwuehfiawuhefoiahuwefiahuwefuiuawheifohawioehfaioweuhfiaawefjaopwejifapowiejfpoaijwefopaiwejfoawjefopjawoepfjaoweijawoefijawefopjiaweopfjawpoejfaopweijfaoiwjefpoawjiefpoijawefpoijaoweijfaowefjiapwoejfapwoefjwefjoeawoifjawopefjawoefawefapweoifjapowejifopawijefoajweopfjawpjeffopaiwjefpoiawjeofjawoejfoawiejfpoaiwjefpoajwepfjapwjiefpawjefoaijwefoawjefpaiwjefopajpweifjapoewjifawpefjawoejfawoepfjaowejfawepfawefuwhefiauwhefioauhwefouhawehfaoiuwehfoaiuwhefoiahuweufioahwieofuhaweoifuhaoiwuehfaoiwuehfoaiwehufiauwhefoiawehfaewhaweifhaoiwhef" />

        </View>
      </ScrollView>
    </View>
  )
}

export default MyProfilePage
