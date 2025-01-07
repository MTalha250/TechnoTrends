// screens/CreateProject.tsx
import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Alert, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import PhotosUploader from "../components/uploader";
import InputField from "../components/inputField";

interface Project {
  title: string;
  description: string;
  poNumber: string;
  poImage: string[];
  clientName: string;
  clientPhone: string;
  surveyPhotos: string[];
  quotationReference: string;
  quotationImage: string[];
}

const CreateProject = () => {
  const [project, setProject] = useState<Project>({
    title: "",
    description: "",
    poNumber: "",
    poImage: [],
    clientName: "",
    clientPhone: "",
    surveyPhotos: [],
    quotationReference: "",
    quotationImage: [],
  });

  const handleChange = (field: keyof Project, value: string) => {
    setProject((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!project.poNumber || !project.clientName || !project.clientPhone) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    console.log("Creating project:", project);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 container my-6">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-white p-2 rounded-full shadow-sm mr-4"
          >
            <MaterialIcons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold">Create Project</Text>
            <Text className="text-gray-600">
              Add a new project to your list
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <InputField
            label="Project Title"
            value={project.title}
            onChangeText={(text) => handleChange("title", text)}
            icon="title"
            required
          />
          <InputField
            label="Project Description"
            value={project.description}
            onChangeText={(text) => handleChange("description", text)}
            icon="description"
            required
          />
          <InputField
            label="Project Order Number"
            value={project.poNumber}
            onChangeText={(text) => handleChange("poNumber", text)}
            icon="assignment"
            required
          />
          <View className="mb-6">
            <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide">
              PO Image
            </Text>
            <PhotosUploader
              addedPhotos={project.poImage}
              onChange={(photos) =>
                setProject((prev) => ({ ...prev, poImage: photos }))
              }
              maxPhotos={1}
            />
          </View>

          <InputField
            label="Client Name"
            value={project.clientName}
            onChangeText={(text) => handleChange("clientName", text)}
            icon="person"
            required
          />

          <InputField
            label="Client Phone"
            value={project.clientPhone}
            onChangeText={(text) => handleChange("clientPhone", text)}
            icon="phone"
            keyboardType="phone-pad"
            required
          />

          <InputField
            label="Quotation Reference"
            value={project.quotationReference}
            onChangeText={(text) => handleChange("quotationReference", text)}
            icon="description"
          />
          <View className="mb-6">
            <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide">
              Quotation Image
            </Text>
            <PhotosUploader
              addedPhotos={project.quotationImage}
              onChange={(photos) =>
                setProject((prev) => ({ ...prev, quotationImage: photos }))
              }
              maxPhotos={1}
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide">
              Survey Photos (Max 5)
            </Text>
            <PhotosUploader
              addedPhotos={project.surveyPhotos}
              onChange={(photos) =>
                setProject((prev) => ({ ...prev, surveyPhotos: photos }))
              }
              maxPhotos={5}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-primary rounded-2xl p-4 justify-center items-center"
        >
          <Text className="text-lg font-semibold text-white">
            Create Project
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateProject;
