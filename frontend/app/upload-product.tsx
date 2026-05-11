import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Alert,
  Modal,
} from "react-native";
// import "../global.css";
import RedButton from "../components/red-button";
import { useLocalSearchParams, useRouter } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";
import { useState, useEffect } from "react";
import React from "react";
import { fetchFromBackend } from "../scripts/authFetch";
import * as ImagePicker from "expo-image-picker";
// nathan: I contributed to this page. Here's the link to my chat history: https://docs.google.com/document/d/1wr2XtPviSqx9qRnxpGCmb86drJmeO4Da0vNocOSU2zY/edit?usp=sharing
// all my comments are human-written to demonstrate understanding.

// nathan: types for photos that exist in the backend
type ExistingPhoto = {
  photoID: number;
  photoURL: string;
  photoPath: string;
};

// nathan: types for photos that are selected in the frontend
type SelectedPhoto = {
  uri: string;
  photoID?: number;
  photoPath?: string;
  isExisting: boolean;
};

const UploadProductPage = () => {
  // nathan: state variables for form fields
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [sold, setSold] = useState(false);
  const [items, setItems] = useState([
    { label: "New", value: "New" },
    { label: "Good", value: "Good" },
    { label: "Fair", value: "Fair" },
    { label: "Poor", value: "Poor" },
  ]);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // nathan: state variables for image uploading/editing 
  const [selectedImages, setSelectedImages] = useState<SelectedPhoto[]>([]);
  const [removedPhotoIds, setRemovedPhotoIds] = useState<number[]>([]);

  const router = useRouter();

  // nathan: this page is structured such that it can be used for creating a new listing or editing an existing listing
  const params = useLocalSearchParams<{
    isEditing?: string;
    initialName?: string;
    initialPrice?: string;
    initialCondition?: string;
    initialLocation?: string;
    initialDescription?: string;
    listingId?: string;
    initialSold?: string;
    initialPhotos?: string;
  }>();

  // nathan: when editing, the parameters will be passed in as strings, but when uploading, they will not exist, in which case we need to set them to their default values
  const resolvedIsEditing = params.isEditing === "true";
  const resolvedName = params.initialName ?? "";
  const resolvedPrice = params.initialPrice ?? "";
  const resolvedCondition = params.initialCondition ?? "";
  const resolvedDescription = params.initialDescription ?? ""; 
  const resolvedSold = params.initialSold === "true";


  // nathan: function to fetch listing photos that already exist 
  const getListingPhotos = async () => {
      const existingPhotos: ExistingPhoto[] = [];
      const response = await fetchFromBackend(`/api/listing/photos?listingID=${params.listingId ? parseFloat(params.listingId) : NaN}`, {
        method: "GET",
      });
      const data = await response.json();
      if (!response.ok) {
        const errorText = data.error || "Failed to fetch listing photos";
        throw new Error(errorText);
      }

      // nathan: add to list of existing photos
      data.map((photo: any) => {
        existingPhotos.push({
          photoID: photo.photo_id,
          photoURL: photo.photo_url,
          photoPath: photo.photo_path,
        });
      });
      return existingPhotos;
    };

    // nathan: function to load in existing photos when editing a listing 
   const loadPhotos = async () => {
        try {
                const photos = await getListingPhotos();
                const normalized = photos.filter((photo) => photo?.photoURL)
                .map((photo) => ({
                        uri: photo.photoURL,
                        photoID: photo.photoID,
                        photoPath: photo.photoPath,
                        isExisting: true,
                }));
                setSelectedImages(normalized.slice(0, 5));
        } catch (error) {
                console.error("Failed to fetch listing photos", error);
        }
        };

  
  useEffect(() => {
    setProductName(resolvedName);
    setPrice(resolvedPrice);
    setDescription(resolvedDescription);
    setSold(resolvedSold);
    if (resolvedCondition) {
      setValue(resolvedCondition);
    }
    if (resolvedIsEditing) {
        loadPhotos();
        console.log("Selected images", selectedImages);
    }



  }, [resolvedName, resolvedPrice, resolvedDescription, resolvedCondition, resolvedSold, params.initialPhotos]);



  // nathan: function to add photos selected in the frontend to the backend 
  const createListingPhotos = async (
    listingID: number,
    photos: SelectedPhoto[],
  ) => {

    // nathan: distinguish between photos that already exist and new photos; if no new photos, return
    const newPhotos = photos.filter((photo) => !photo.isExisting);
    if (newPhotos.length === 0) {
      return;
    }

    // nathan: for each new photos, send the blob to the backend so it can add it to an image bucket and return the public URL
    const responses = await Promise.all(
      newPhotos.map(async (photo) => {
        const res = await fetch(photo.uri);
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch photo for upload: ${errorText}`);
        }
        const blob = await res.blob();
        console.log(blob.type)
        const uploadRes = await fetchFromBackend("/api/listings/photo-upload", {
                method: "POST",
                headers: {
                  "Content-Type": "image/jpeg",
                  'File-Metadata': JSON.stringify({"filename": `listing_${listingID}_${Date.now()}.jpg`})
                },
                body: blob,
        });
        if (!uploadRes.ok) {
                const errorText = await uploadRes.text();
                throw new Error(`Failed to upload photo: ${errorText}`);
        }
        
        // nathan: get the file path and URL from the backend for the phot then add that to the database with the listing ID
        const { filePath, publicUrl } = await uploadRes.json();
        console.log("Photo url", publicUrl);
        return fetchFromBackend("/api/listing/photos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            listingID,
            photoURL: publicUrl,
            photoPath: filePath,
          }),
        });
        })
    );
    const failed = responses.find((response) => !response.ok);
    if (failed) {
      const errorText = await failed.text();
      throw new Error(`Failed to upload photos: ${errorText}`);
    }

  };

  // nathan: function to deltete photos by ID by removing them from the backend 
  const deleteListingPhotos = async (photoIds: number[]) => {
    if (photoIds.length === 0) {
        
      return;
    }
    const responses = await Promise.all(
      photoIds.map((photoID) =>
        fetchFromBackend("/api/listing/photos", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(photoID),
        }),
      ),
    );

    const failed = responses.find((response) => !response.ok);
    if (failed) {
      const errorText = await failed.text();
      throw new Error(`Failed to delete photos: ${errorText}`);
    }
  };

   // nathan: function to handle form submission
   // works for uploading and editing 
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
        product_desc: description || null,
        sold: sold,
      };

      if (resolvedIsEditing) {
        const listingId = params.listingId ? parseFloat(params.listingId) : NaN;
        if (!listingId) {
          alert("Listing ID is missing");
          return;
        }

        // nathan: if editng, make a patch request 
        const response = await fetchFromBackend(
          `/api/listing/${listingId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(listingData),
          },
        );

        if (!response.ok) {
          const error = await response.json();
          alert(error.error || "Failed to update listing");
          return;
        }
        console.log(response.body);

        // nathan: delete photos that were removed and create photos taht were added
        await deleteListingPhotos(removedPhotoIds);
        await createListingPhotos(listingId, selectedImages);

        alert("Listing updated successfully");
      } else {
        // nathan: if not editing, post the listing in the database associated with the user and create the added photos 
        const userResponse = await fetchFromBackend(
          "/api/user",
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        if (!userResponse.ok) {
          alert("Failed to get user information");
          return;
        }
        const userData = await userResponse.json();
        const response = await fetchFromBackend(
          "/api/listing",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: userData.user_id,
              ...listingData,
            }),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          alert(`Failed to create listing: ${errorText}`);
          return;
        }

        const createdListing = await response.json();
        const createdListingId = Number(createdListing?.listing_id);
        if (Number.isNaN(createdListingId)) {
          alert(
            "Listing was created but listing ID is missing for photo upload.",
          );
          return;
        }

        await createListingPhotos(createdListingId, selectedImages);

        alert("Listing created successfully");
      }

      router.push("/my-profile");
    } catch (error) {
      console.error("Error submitting listing:", error);
      alert("An error occurred while submitting the listing");
    } finally {
      setIsLoading(false);
    }
  };

  // nathan: if delete button is clicked (only when editing), delete the listing
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

    // nathan: delete listing from backend
    try {
      const response = await fetchFromBackend(
        `/api/listing/${listingId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        },
      );

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

      alert("Listing deleted successfully");
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("An error occurred while deleting the listing");
    } finally {
      setIsLoading(false);
      router.push("/my-profile");
    }
  };

  // nathan: function that uses expo image picker to handle uploaded images 
  // frontend handles maximum of 5 images

  const handlePickImages = async () => {
    if (selectedImages.length >= 5) {
      Alert.alert("Image limit reached", "You can upload up to 5 images.");
      return;
    }

    // nathan: expo image picker uses this function to request permission from user to access photos 
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo library access to upload images.",
      );
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

    // nathan: update selected images with the photos obtained from expo image picker
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
      <Text className="text-black  font-bold text-3xl m-4">
        {resolvedIsEditing ? "Edit Product" : "Upload Product"} 
      </Text>
        {resolvedIsEditing &&  <View className="flex-row justify-between m-2">
                <Text className="text-lg font-medium p-3">Mark as Sold:</Text>
                <Pressable
                        className={`rounded-lg w-12 h-12 shadow-sm p-3 overflow-y-scroll ${sold ? 'bg-gray-500' : 'bg-gray-300'}`}
                        onPress={() => {
                          setSold(prev => !prev);
                        }}
                />
        </View>}
       
      <View className="flex-row justify-between m-2">
        <Text className="text-lg font-medium p-3">Product Name:</Text>
        <TextInput
          className="bg-gray-300 rounded-lg w-[50%] p-3 overflow-y-scroll"
          placeholder="Enter"
          placeholderTextColor={"#6a6b6b"}
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
          style={{ borderWidth: 0, backgroundColor: "#D1D5DB" }}
          dropDownContainerStyle={{
            borderWidth: 1,
            borderColor: "rgb(55 65 81 / 0.7)",
            backgroundColor: "#D1D5DB",
          }}
          containerStyle={{ width: "50%" }}
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
              <Text className="text-sm text-gray-700/70 mt-2">
                {selectedImages.length}/5
              </Text>
            </View>
          </Pressable>
          {selectedImages.length > 0 && (
            <View className="mt-3 ml-3 mr-3 flex-row flex-wrap max-w-48  justify-between">
              {selectedImages.map((photo, index) => (
                <View
                  key={`${photo.uri}-${index}`}
                  className="w-[48%] h-20 mb-2 relative"
                >
                  <Image
                    source={{ uri: photo.uri }}
                    className="w-full h-full rounded-lg"
                  />
                  <Pressable
                    onPress={() => {
                      if (photo.photoID) {
                        setRemovedPhotoIds((prev) => [
                          ...new Set([...prev, photo.photoID as number]),
                        ]);
                      }
                      setSelectedImages((prev) =>
                        prev.filter((_, i) => i !== index),
                      );
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
        <RedButton text="Cancel" onPressFunction={() => router.push("/my-profile")} />
        {/* <Pressable
          onPress={handleSubmit}
          disabled={isLoading}
          className="mb-4 mt-auto w-52 bg-umass-red rounded-xl p-3 items-center"
        >
          <Text className="text-white font-bold">
            {isLoading ? "Loading..." : resolvedIsEditing ? "Update" : "Upload"}
          </Text>
        </Pressable> */}
        <RedButton disabled={isLoading} onPressFunction={handleSubmit} text={isLoading ? "Loading..." : resolvedIsEditing ? "Update" : "Upload"} />
      </View>
      <View className="flex-row justify-around">
        {resolvedIsEditing && (
          // <Pressable
          //   onPress={() => handleDelete()}
          //   className="mb-4 mt-auto w-52 bg-umass-red rounded-xl p-3 items-center"
          // >
          //   <Text className="text-white font-bold">Delete</Text>
          // </Pressable>
          <RedButton onPressFunction={handleDelete} text="Delete" />
        )}
      </View>
    </ScrollView>
  );
};

export default UploadProductPage;


