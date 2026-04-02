import { View, Text, ScrollView, Pressable, TextInput } from "react-native"
import "../global.css"
import Navbar from "../components/navbar"
import ProfileFeedBanner from "../components/profile-feed-banner"
import FeedCard from "../components/feed-card"
import { useLocalSearchParams, useRouter } from "expo-router"
import DropDownPicker from "react-native-dropdown-picker"
import { useState } from "react"

interface UploadProductPageProps {
    isEditing?: boolean
    initialName?: string
    initialPrice?: string
    initialLocation?: string
    initialDescription?: string
    initialCondition?: string
}


const UploadProductPage = ({ 
        isEditing = false,
        initialName = "",
        initialPrice = "",
        initialLocation = "",
        initialDescription = "",
        initialCondition = ""
}: UploadProductPageProps) => {
        






        const [open, setOpen] = useState(false);
        const [value, setValue] = useState(null);
        const [items, setItems] = useState([
        {label: 'Good', value: 'good'},
        {label: 'Fair', value: 'fair'},
        {label: 'Poor', value: 'poor'}
        ]);
        const router = useRouter()
        const params = useLocalSearchParams<{
                isEditing?: string
                initialName?: string
                initialPrice?: string
                initialCondition?: string
                initialLocation?: string
                initialDescription?: string
        }>()

        const resolvedIsEditing = params.isEditing === "true" || isEditing
        const resolvedName = params.initialName ?? initialName
        const resolvedPrice = params.initialPrice ?? initialPrice
        const resolvedCondition = params.initialCondition ?? initialCondition
        const resolvedLocation = params.initialLocation ?? initialLocation
        const resolvedDescription = params.initialDescription ?? initialDescription
        
        
    return (
        <View>
                <Text className="text-black  font-bold text-3xl m-4">{resolvedIsEditing ? "Edit" : "Upload"} Product</Text>
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
                        <Text className="text-lg font-medium p-3">Condition:</Text>
                        <DropDownPicker
                                open={open}
                                value={value}
                                items={items}   
                                setOpen={setOpen}
                                setValue={setValue}
                                setItems={setItems}
                                placeholder={resolvedCondition}
                                style={{borderWidth:0, backgroundColor: "#D1D5DB"}}
                                dropDownContainerStyle={{borderWidth:1,borderColor: "rgb(55 65 81 / 0.7)", backgroundColor: "#D1D5DB"}}
                                containerStyle={{width: "50%"}}
                        />      
                </View>

                <View className="flex-col m-2">
                        <Text className="text-lg font-medium p-3">Images:</Text>
                        <Pressable className="ml-3 w-44 h-64 bg-gray-300 shadow-md rounded-lg items-center justify-center">
                                <View className="w-[84%] h-[84%] rounded-lg border-2 border-dashed border-gray-700/70 items-center justify-center">
                                <Text className="text-7xl text-gray-700/70">+</Text>
                                </View>
                        </Pressable>
                </View>
                <View className="flex-col m-2 mb-6">
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
                        <Pressable onPress={() => router.push("/my-profile")} className="mb-4 mt-auto w-52 bg-umass-red rounded-xl p-3 items-center">
                                <Text className="text-white font-bold">Cancel</Text>
                        </Pressable>
                        <Pressable onPress={() => router.push("/my-profile")} className="mb-4 mt-auto w-52 bg-umass-red rounded-xl p-3 items-center">
                                <Text className="text-white font-bold">{resolvedIsEditing ? "Update" : "Upload"}</Text>
                        </Pressable>
                </View>
                <View className="flex-row justify-around">
                                {resolvedIsEditing && (
                                        <Pressable onPress={() => router.back()} className="mb-4 mt-auto w-52 bg-umass-red rounded-xl p-3 items-center">
                                                        <Text className="text-white font-bold">Delete</Text>
                                        </Pressable>
                                )}
                </View>
                
        </View>
    )
}

export default UploadProductPage
