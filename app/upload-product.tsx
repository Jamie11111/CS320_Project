import { View, Text, ScrollView, Pressable, TextInput, Image, Alert, Modal } from "react-native"
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
import * as ImagePicker from "expo-image-picker"

type ExistingPhoto = {
        photoID: number
        photoURL: string
        photoPath: string
}

type SelectedPhoto = {
        uri: string
        photoID?: number
        photoPath?: string
        isExisting: boolean
}

interface UploadProductPageProps {
    isEditing?: boolean
    initialName?: string
    initialPrice?: string
    initialLocation?: string
    initialDescription?: string
    initialCondition?: string
    listingId?: string
        initialPhotos?: string
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
        const [selectedImages, setSelectedImages] = useState<SelectedPhoto[]>([]);
        const [removedPhotoIds, setRemovedPhotoIds] = useState<number[]>([]);
        
        const router = useRouter()
        const params = useLocalSearchParams<{
                isEditing?: string
                initialName?: string
                initialPrice?: string
                initialCondition?: string
                initialLocation?: string
                initialDescription?: string
                listingId?: string
                initialPhotos?: string
        }>()
        const resolvedIsEditing = params.isEditing === "true" || isEditing
        const resolvedName = params.initialName ?? initialName
        const resolvedPrice = params.initialPrice ?? initialPrice
        const resolvedCondition = params.initialCondition ?? initialCondition
        const resolvedLocation = params.initialLocation ?? initialLocation
        const resolvedDescription = params.initialDescription ?? initialDescription
        
        useEffect(() => {
                console.log("Params:\n", params);
                setProductName(resolvedName);
                setPrice(resolvedPrice);
                setDescription(resolvedDescription);
                if (resolvedCondition) {
                        setValue(resolvedCondition);
                }

                if (params.initialPhotos) {
                        try {
                                const parsed = JSON.parse(params.initialPhotos) as ExistingPhoto[];
                                if (Array.isArray(parsed)) {
                                        const normalized = parsed
                                                .filter((photo) => photo?.photoURL)
                                                .map((photo) => ({
                                                        uri: photo.photoURL,
                                                        photoID: photo.photoID,
                                                        photoPath: photo.photoPath,
                                                        isExisting: true,
                                                }));
                                        setSelectedImages(normalized.slice(0, 5));
                                }
                        } catch (error) {
                                console.error("Failed to parse initial photos", error);
                        }
                }
        }, [resolvedName, resolvedPrice, resolvedDescription, resolvedCondition]);

        const createListingPhotos = async (listingID: number, photos: SelectedPhoto[]) => {
                const newPhotos = photos.filter((photo) => !photo.isExisting);
                if (newPhotos.length === 0) {
                        return;
                }

                const responses = await Promise.all(
                        newPhotos.map((photo) =>
                                fetchWithAuth("http://localhost:3000/api/listing/photos", {
                                        method: "POST",
                                        headers: {
                                                "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                                listingID,
                                                photoURL: photo.uri,
                                                photoPath: photo.uri,
                                        }),
                                })
                        )
                );

                const failed = responses.find((response) => !response.ok);
                if (failed) {
                        const errorText = await failed.text();
                        throw new Error(`Failed to upload photos: ${errorText}`);
                }
        };

        const deleteListingPhotos = async (photoIds: number[]) => {
                if (photoIds.length === 0) {
                        return;
                }

                const responses = await Promise.all(
                        photoIds.map((photoID) =>
                                fetchWithAuth("http://localhost:3000/api/listing/photos", {
                                        method: "DELETE",
                                        headers: {
                                                "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify(photoID),
                                })
                        )
                );

                const failed = responses.find((response) => !response.ok);
                if (failed) {
                        const errorText = await failed.text();
                        throw new Error(`Failed to delete photos: ${errorText}`);
                }
        };
        
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
                                const listingId = params.listingId ? parseFloat(params.listingId) : NaN;
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

                                await deleteListingPhotos(removedPhotoIds);
                                await createListingPhotos(listingId, selectedImages);
                                
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

                                const createdListing = await response.json();
                                const createdListingId = Number(createdListing?.listing_id);
                                if (Number.isNaN(createdListingId)) {
                                        alert("Listing was created but listing ID is missing for photo upload.");
                                        return;
                                }

                                await createListingPhotos(createdListingId, selectedImages);
                                
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
        const handleDelete = async () => {
                if (!resolvedIsEditing) {
                        alert("Not in editing mode");
                        return;
                }
                const listingId = params.listingId ? parseFloat(params.listingId) : NaN;
                if (!listingId) {
                        alert("Listing ID is missing");
                        return;
                }
                setIsLoading(true);
                try {
                        const response = await fetchWithAuth(`http://localhost:3000/api/listing/${listingId}`, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                        });
                        
                        if (!response.ok) {
                                const raw = await response.text();
                                let message = `Failed to delete listing (${response.status})`;

                                if (raw) {
                                        try {
                                                const parsed = JSON.parse(raw);
                                                message = parsed.error ?? message;
                                        } catch {
                                                message = raw;
                                        }
                                }
                        }

                        
                        
                        alert('Listing deleted successfully');
                } catch (error) {
                        console.error('Error deleting listing:', error);
                        alert('An error occurred while deleting the listing');
                } finally {
                        setIsLoading(false);
                        router.push('/my-profile');
                }
        };

        const handlePickImages = async () => {
                if (selectedImages.length >= 5) {
                        Alert.alert("Image limit reached", "You can upload up to 5 images.");
                        return;
                }

                const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!permission.granted) {
                        Alert.alert("Permission required", "Please allow photo library access to upload images.");
                        return;
                }

                const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ["images"],
                        allowsMultipleSelection: true,
                        selectionLimit: 5 - selectedImages.length,
                        quality: 0.8,
                });

                if (result.canceled) {
                        return;
                }

                const pickedUris = result.assets.map((asset) => asset.uri);
                const pickedPhotos: SelectedPhoto[] = pickedUris.map((uri) => ({
                        uri,
                        isExisting: false,
                }));
                const updated = [...selectedImages, ...pickedPhotos].slice(0, 5);
                setSelectedImages(updated);
        };
        
        
    return (
        <ScrollView className="flex-1">
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
                                listMode="SCROLLVIEW"
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
                        <View className="flex-row items-center">
                                <Pressable
                                        onPress={handlePickImages}
                                        className="ml-3 w-44 h-64 bg-gray-300 shadow-md rounded-lg items-center justify-center"
                                >
                                        <View className="w-[84%] h-[84%] rounded-lg border-2 border-dashed border-gray-700/70 items-center justify-center">
                                        <Text className="text-7xl text-gray-700/70">+</Text>
                                        <Text className="text-sm text-gray-700/70 mt-2">{selectedImages.length}/5</Text>
                                        </View>
                                </Pressable>
                                {selectedImages.length > 0 && (
                                        <View className="mt-3 ml-3 mr-3 flex-row flex-wrap max-w-48  justify-between">
                                                {selectedImages.map((photo, index) => (
                                                        <View key={`${photo.uri}-${index}`} className="w-[48%] h-20 mb-2 relative">
                                                                <Image
                                                                        source={{ uri: photo.uri }}
                                                                        className="w-full h-full rounded-lg"
                                                                />
                                                                <Pressable
                                                                        onPress={() => {
                                                                                if (photo.photoID) {
                                                                                        setRemovedPhotoIds((prev) => [...new Set([...prev, photo.photoID as number])]);
                                                                                }
                                                                                setSelectedImages((prev) => prev.filter((_, i) => i !== index));
                                                                        }}
                                                                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 items-center justify-center"
                                                                >
                                                                        <Text className="text-white text-xs font-bold">X</Text>
                                                                </Pressable>
                                                        </View>
                                                ))}
                                        </View>
                                )}
                        </View>
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
                                <Pressable onPress={() => handleDelete()} className="mb-4 mt-auto w-52 bg-umass-red rounded-xl p-3 items-center">
                                                <Text className="text-white font-bold">Delete</Text>
                                </Pressable>
                        )}
                </View>
                
        </ScrollView>
    )
}

export default UploadProductPage
