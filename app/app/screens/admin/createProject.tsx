import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Text,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import PhotosUploader from "@/components/uploader";
import InputField from "@/components/inputField";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import useAuthStore from "@/store/authStore";
import { ActivityIndicator } from "react-native-paper";

const CreateProject = () => {
  const [project, setProject] = useState<Partial<Project>>({
    title: "",
    description: "",
    poNumber: "",
    poImage: "",
    clientName: "",
    clientPhone: "",
    surveyPhotos: [],
    quotationReference: "",
    quotationImage: "",
    dueDate: null,
  });
  const { user } = useAuthStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      handleChange("dueDate", selectedDate);
    }
  };

  const handleChange = (field: keyof Project, value: string | Date | null) => {
    setProject((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (
      !project.poNumber ||
      !project.poImage ||
      !project.title ||
      !project.description ||
      !project.clientName ||
      !project.clientPhone ||
      !project.quotationReference ||
      !project.quotationImage ||
      !project.surveyPhotos?.length ||
      !project.dueDate
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/projects`, {
        ...project,
        assignedBy: user?.id,
        status: "Pending",
      });
      Alert.alert("Success", "Project created successfully");
      setProject({
        title: "",
        description: "",
        poNumber: "",
        poImage: "",
        clientName: "",
        clientPhone: "",
        surveyPhotos: [],
        quotationReference: "",
        quotationImage: "",
        dueDate: null,
      });
      router.back();
    } catch (error) {
      console.error("Error creating project", error);
      Alert.alert("Error", "An error occurred while creating the project");
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 container">
        <View className="my-6">
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
              label="Project Order Number"
              value={project.poNumber || ""}
              onChangeText={(text) => handleChange("poNumber", text)}
              icon="assignment"
              placeholder="Enter project order number"
              required
            />
            <View className="mb-6">
              <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide">
                Project Order Image <Text className="text-red-500">*</Text>
              </Text>
              <PhotosUploader
                addedPhotos={project.poImage ? [project.poImage] : []}
                onChange={(photos) =>
                  setProject((prev) => ({ ...prev, poImage: photos[0] }))
                }
                maxPhotos={1}
              />
            </View>
            <InputField
              label="Project Title"
              value={project.title || ""}
              onChangeText={(text) => handleChange("title", text)}
              icon="title"
              placeholder="Enter project title"
              required
            />
            <InputField
              label="Project Description"
              value={project.description || ""}
              onChangeText={(text) => handleChange("description", text)}
              icon="description"
              placeholder="Enter project description"
              required
            />

            <InputField
              label="Client Name"
              value={project.clientName || ""}
              onChangeText={(text) => handleChange("clientName", text)}
              icon="person"
              placeholder="Enter client name"
              required
            />

            <InputField
              label="Client Phone"
              placeholder="Enter client phone number"
              value={project.clientPhone || ""}
              onChangeText={(text) => handleChange("clientPhone", text)}
              icon="phone"
              keyboardType="phone-pad"
              required
            />

            <InputField
              label="Quotation Reference"
              placeholder="Enter quotation reference"
              value={project.quotationReference || ""}
              onChangeText={(text) => handleChange("quotationReference", text)}
              icon="description"
              required
            />
            <View className="mb-6">
              <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide">
                Quotation Image <Text className="text-red-500">*</Text>
              </Text>
              <PhotosUploader
                addedPhotos={
                  project.quotationImage ? [project.quotationImage] : []
                }
                onChange={(photos) =>
                  setProject((prev) => ({ ...prev, quotationImage: photos[0] }))
                }
                maxPhotos={1}
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide">
                Survey Photos (Max 5) <Text className="text-red-500">*</Text>
              </Text>
              <PhotosUploader
                addedPhotos={project.surveyPhotos || []}
                onChange={(photos) =>
                  setProject((prev) => ({ ...prev, surveyPhotos: photos }))
                }
                maxPhotos={5}
              />
            </View>

            {/* Due Date */}
            <View className="mb-6">
              <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide mb-4">
                Due Date <Text className="text-red-500">*</Text>
              </Text>
              {Platform.OS === "android" ? (
                <TouchableOpacity
                  onPress={showDatePickerModal}
                  className="flex-row items-center bg-white rounded-xl border border-gray-200 p-4"
                >
                  <MaterialIcons
                    name="event"
                    size={24}
                    color="#6B7280"
                    style={{ marginRight: 10 }}
                  />
                  <Text className="text-black">
                    {project.dueDate
                      ? project.dueDate.toLocaleDateString()
                      : "Select due date"}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {(showDatePicker || Platform.OS === "ios") && (
                <DateTimePicker
                  value={project.dueDate || new Date()}
                  mode="date"
                  minimumDate={new Date()}
                  accentColor="#A82F39"
                  onChange={handleDateChange}
                />
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`bg-primary rounded-2xl p-4 justify-center items-center ${
              loading ? "opacity-50" : ""
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-lg font-semibold text-white">
                Create Project
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateProject;
