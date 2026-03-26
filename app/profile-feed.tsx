import { View, Text, ScrollView } from "react-native"
import "../global.css"
import Navbar from "../components/navbar"
import ProfileFeedBanner from "../components/profile-feed-banner"
import FeedCard from "../components/feed-card"
const ProfileFeedPage = () => {

  return (
    <View >
      <Navbar />
      <ProfileFeedBanner authorName="John Doe" authorLocation="Amherst, MA" />
      <ScrollView >
        <View className="flex-row flex-wrap justify-center mb-48">
          <FeedCard/>
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

export default ProfileFeedPage
