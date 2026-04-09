import { View, Text, ScrollView, Pressable, TextInput } from "react-native"
import "../global.css"
import Navbar from "../components/navbar"
import ProfileFeedBanner from "../components/profile-feed-banner"
import FeedCard from "../components/feed-card"
import { useLocalSearchParams, useRouter } from "expo-router"
import DropDownPicker from "react-native-dropdown-picker"
import { useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import React from "react"
import {fetchWithAuth} from "../scripts/authFetch"
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
        {label: 'New', value: 'New'},
        {label: 'Good', value: 'Good'},
        {label: 'Fair', value: 'Fair'},
        {label: 'Poor', value: 'Poor'}
        ]);
        const [productName, setProductName] = useState("");
        const [price, setPrice] = useState("");
        const [description, setDescription] = useState("");
        const [isLoading, setIsLoading] = useState(false);
        
        const router = useRouter()
        const params = useLocalSearchParams<{
                isEditing?: string
                initialName?: string
                initialPrice?: string
                initialCondition?: string
                initialLocation?: string
                initialDescription?: string
                listingId?: string
        }>()
        const resolvedIsEditing = params.isEditing === "true" || isEditing
        const resolvedName = params.initialName ?? initialName
        const resolvedPrice = params.initialPrice ?? initialPrice
        const resolvedCondition = params.initialCondition ?? initialCondition
        const resolvedLocation = params.initialLocation ?? initialLocation
        const resolvedDescription = params.initialDescription ?? initialDescription
        
        useEffect(() => {
                setProductName(resolvedName);
                setPrice(resolvedPrice);
                setDescription(resolvedDescription);
                if (resolvedCondition) {
                        setValue(resolvedCondition);
                }
        }, [resolvedName, resolvedPrice, resolvedDescription, resolvedCondition]);
        
        const handleSubmit = async () => {
                if (!productName.trim() || !price.trim() || !value) {
                        alert("Please fill in all required fields");
                        return;
                }
                if (isNaN(parseFloat(price))) {
                        alert("Price should be a number.");
                        return;
                }
                
                setIsLoading(true);
                try {
                        const listingData = {
                                product_name: productName,
                                price: parseFloat(price),
                                item_condition: value,
                                product_desc: description || null
                        };
                        
                        if (resolvedIsEditing) {
                                const listingId = params.listingId;
                                if (!listingId) {
                                        alert("Listing ID is missing");
                                        return;
                                }
                                
                                const response = await fetchWithAuth(`http://localhost:3000/api/listing/${listingId}`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(listingData)
                                });
                                
                                if (!response.ok) {
                                        const error = await response.json();
                                        alert(error.error || 'Failed to update listing');
                                        return;
                                }
                                
                                alert('Listing updated successfully');
                        } else {
                                const userResponse = await fetchWithAuth('http://localhost:3000/api/user', {
                                headers: {
                                        'Content-Type': 'application/json'
                                }
                                });
                                if (!userResponse.ok) {
                                        alert('Failed to get user information');
                                        return;
                                }
                                
                                
                                const userData = await userResponse.json();
                                const response = await fetchWithAuth('http://localhost:3000/api/listing', {
                                        method: 'POST',
                                        headers: {
                                                'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                                user_id: userData.user_id,
                                                ...listingData
                                        })
                                });

                                if (!response.ok) {
                                        const errorText = await response.text();
                                        alert(`Failed to create listing: ${errorText}`);
                                        return;
                                }
                                
                                alert('Listing created successfully');
                        }
                        
                        router.push('/my-profile');
                } catch (error) {
                        console.error('Error submitting listing:', error);
                        alert('An error occurred while submitting the listing');
                } finally {
                        setIsLoading(false);
                }
        };
        
        
    return (
        <View>
                <Text className="text-black  font-bold text-3xl m-4">{resolvedIsEditing ? "Edit" : "Upload"} Product</Text>
                <View className="flex-row justify-between m-2">
                        <Text className="text-lg font-medium p-3">Product Name:</Text>
                        <TextInput 
                                className="bg-gray-300 rounded-lg w-[50%] p-3 overflow-y-scroll" 
                                placeholder="Enter"
                                value={productName}
                                onChangeText={setProductName}
                                maxLength={50}
                        />
                </View>
                <View className="flex-row justify-between m-2">
                        <Text className="text-lg font-medium p-3">Price:</Text>
                        <TextInput 
                                className="bg-gray-300 rounded-lg w-[50%] p-3 overflow-y-scroll" 
                                placeholder="Enter"
                                value={price}
                                onChangeText={setPrice}
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
                                value={description}
                                onChangeText={setDescription}
                                maxLength={200}
                                multiline
                        />
                </View>
                <View className="flex-row justify-around">
                        <Pressable onPress={() => router.push("/my-profile")} className="mb-4 mt-auto w-52 bg-umass-red rounded-xl p-3 items-center">
                                <Text className="text-white font-bold">Cancel</Text>
                        </Pressable>
                        <Pressable onPress={handleSubmit} disabled={isLoading} className="mb-4 mt-auto w-52 bg-umass-red rounded-xl p-3 items-center">
                                <Text className="text-white font-bold">{isLoading ? "Loading..." : (resolvedIsEditing ? "Update" : "Upload")}</Text>
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
