import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import axios from "axios";

const CLOUDINARY_UPLOAD_PRESET = "techno";
const CLOUDINARY_CLOUD_NAME = "dewqsghdi";

interface ImageUploaderProps {
  addedPhotos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}

const PhotosUploader: React.FC<ImageUploaderProps> = ({
  addedPhotos,
  onChange,
  maxPhotos = 5,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant camera roll permissions"
        );
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        return result.assets[0];
      }
      return null;
    } catch (error) {
      console.log("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
      return null;
    }
  };

  const uploadToCloudinary = async (uri: string) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1000 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const formData = new FormData();
      formData.append("file", {
        uri: manipResult.uri,
        type: "image/jpeg",
        name: "upload.jpg",
      } as any);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.secure_url;
    } catch (error) {
      console.log("Error uploading to Cloudinary:", error);
      throw new Error("Failed to upload image");
    }
  };

  const handleImageUpload = async () => {
    if (addedPhotos.length >= maxPhotos) {
      Alert.alert("Limit Reached", `Maximum ${maxPhotos} photos allowed`);
      return;
    }

    try {
      setIsUploading(true);

      const pickedImage = await pickImage();
      if (!pickedImage) {
        setIsUploading(false);
        return;
      }

      const cloudinaryUrl = await uploadToCloudinary(pickedImage.uri);

      if (cloudinaryUrl) {
        onChange([...addedPhotos, cloudinaryUrl]);
      }
    } catch (error) {
      Alert.alert(
        "Upload Failed",
        "There was an error uploading your image. Please try again."
      );
      console.log("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (photoToRemove: string) => {
    Alert.alert("Remove Photo", "Are you sure you want to remove this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const newPhotos = addedPhotos.filter(
            (photo) => photo !== photoToRemove
          );
          onChange(newPhotos);
        },
      },
    ]);
  };

  const setMainPhoto = (photo: string) => {
    const newPhotos = [photo, ...addedPhotos.filter((p) => p !== photo)];
    onChange(newPhotos);
  };

  return (
    <View className="mt-4">
      <FlatList
        horizontal
        data={[...addedPhotos, "ADD_BUTTON"]}
        keyExtractor={(item, index) => item + index}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexDirection: "row", gap: 16 }}
        renderItem={({ item, index }) => {
          if (item === "ADD_BUTTON") {
            return addedPhotos.length < maxPhotos ? (
              <TouchableOpacity
                onPress={handleImageUpload}
                disabled={isUploading}
                className="rounded-lg items-center justify-center"
                style={{ width: 80, height: 80, backgroundColor: "#f0f0f0" }}
              >
                {isUploading ? (
                  <ActivityIndicator color="#666" />
                ) : (
                  <MaterialIcons name="add-a-photo" size={24} color="#666" />
                )}
              </TouchableOpacity>
            ) : null;
          }

          return (
            <View
              key={index}
              className="relative"
              style={{ position: "relative", width: 80, height: 80 }}
            >
              <Image
                source={{ uri: item }}
                className="rounded-lg"
                style={{ width: 80, height: 80 }}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  borderRadius: 50,
                  padding: 4,
                  zIndex: 1,
                }}
                onPress={() => removePhoto(item)}
              >
                <MaterialIcons name="close" size={16} color="white" />
              </TouchableOpacity>
              {index === 0 ? (
                <View
                  style={{
                    position: "absolute",
                    bottom: 4,
                    left: 4,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    borderRadius: 50,
                    padding: 4,
                  }}
                >
                  <MaterialIcons name="star" size={16} color="yellow" />
                </View>
              ) : (
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    bottom: 4,
                    left: 4,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    borderRadius: 50,
                    padding: 4,
                  }}
                  onPress={() => setMainPhoto(item)}
                >
                  <MaterialIcons name="star-border" size={16} color="white" />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

export default PhotosUploader;
