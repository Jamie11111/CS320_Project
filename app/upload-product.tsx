import { View, Text, ScrollView, Pressable, TextInput } from "react-native"
import "../global.css"
import Navbar from "../components/navbar"
import ProfileFeedBanner from "../components/profile-feed-banner"
import FeedCard from "../components/feed-card"
import { useLocalSearchParams } from "expo-router"

interface UploadProductPageProps {
    isEditing?: boolean
    initialName?: string
    initialPrice?: string
    initialLocation?: string
    initialDescription?: string
}

const UploadProductPage = ({ 
    isEditing = false,
    initialName = "",
    initialPrice = "",
    initialLocation = "",
    initialDescription = ""
}: UploadProductPageProps) => {
        const params = useLocalSearchParams<{
                isEditing?: string
                initialName?: string
                initialPrice?: string
                initialLocation?: string
                initialDescription?: string
        }>()

        const resolvedIsEditing = params.isEditing === "true" || isEditing
        const resolvedName = params.initialName ?? initialName
        const resolvedPrice = params.initialPrice ?? initialPrice
        const resolvedLocation = params.initialLocation ?? initialLocation
        const resolvedDescription = params.initialDescription ?? initialDescription

    return (
        <View>
                <View className="flex-row justify-between m-2">
                        <Text className="text-lg font-medium p-3">Product Name:</Text>
                        <TextInput 
                                className="bg-gray-300 rounded-lg w-[50%] p-3 overflow-y-scroll" 
                                placeholder="Enter"
                                defaultValue={resolvedName}
                                maxLength={50}
                        />
                </View>
                <View className="flex-row justify-between m-2">
                        <Text className="text-lg font-medium p-3">Price:</Text>
                        <TextInput 
                                className="bg-gray-300 rounded-lg w-[50%] p-3 overflow-y-scroll" 
                                placeholder="Enter"
                                defaultValue={resolvedPrice}
                                maxLength={50}
                        />
                </View>
                <View className="flex-row justify-between m-2">
                        <Text className="text-lg font-medium p-3">Location:</Text>
                        <TextInput 
                                className="bg-gray-300 rounded-lg w-[50%] p-3 overflow-y-scroll" 
                                placeholder="Enter"
                                defaultValue={resolvedLocation}
                                maxLength={50}
                        />
                </View>
                <View className="flex-col m-2">
                        <Text className="text-lg font-medium p-3">Images:</Text>
                        <Pressable className="ml-3 w-44 h-64 bg-gray-300 rounded-lg items-center justify-center">
                                <View className="w-[84%] h-[84%] rounded-lg border-2 border-dashed border-gray-700/70 items-center justify-center">
                                <Text className="text-7xl text-gray-700/70">+</Text>
                                </View>
                        </Pressable>
                </View>
                <View className="flex-col m-2 mb-16">
                        <Text className="text-lg font-medium p-3">Description:</Text>
                        <TextInput 
                                className="ml-3 mr-3 bg-gray-300 rounded-lg h-32 p-3"
                                placeholder="Enter"
                                defaultValue={resolvedDescription}
                                maxLength={200}
                                multiline
                        />
                </View>
                <View className="flex-row justify-around">
                        <Pressable className="mb-4 mt-auto w-52 bg-umass-red rounded-xl p-3 items-center">
                                <Text className="text-white font-bold">Cancel</Text>
                        </Pressable>
                        <Pressable className="mb-4 mt-auto w-52 bg-umass-red rounded-xl p-3 items-center">
                                <Text className="text-white font-bold">{resolvedIsEditing ? "Update" : "Upload"}</Text>
                        </Pressable>
                </View>
        </View>
    )
}

export default UploadProductPage
