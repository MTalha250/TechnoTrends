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
  const [project, setProject] = useState({
    clientName: "",
    description: "",
    surveyPhotos: [] as string[],
    quotationReference: "",
    poNumber: "",
    jcReference: [] as { jcReference: string }[],
    dcReference: [] as { dcReference: string }[],
    remarks: "",
    dueDate: null,
  });
  const { user } = useAuthStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [jcReference, setJcReference] = useState("");
  const [dcReference, setDcReference] = useState("");
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
    if (!project.clientName) {
      Alert.alert("Error", "Client name is required");
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/projects`, {
        ...project,
        createdBy: user?.name,
        status: "Pending",
      });
      Alert.alert("Success", "Project created successfully");
      setProject({
        clientName: "",
        description: "",
        surveyPhotos: [],
        quotationReference: "",
        poNumber: "",
        jcReference: [],
        dcReference: [],
        remarks: "",
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
    <SafeAreaView className="flex-1 bg-gray-50">
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
              label="Client"
              value={project.clientName || ""}
              onChangeText={(text) => handleChange("clientName", text)}
              icon="person"
              placeholder="Enter client name"
              required
            />

            <InputField
              label="Project Description"
              value={project.description || ""}
              onChangeText={(text) => handleChange("description", text)}
              icon="description"
              placeholder="Enter project description"
            />
            <InputField
              label="PO Number"
              value={project.poNumber || ""}
              onChangeText={(text) => handleChange("poNumber", text)}
              icon="receipt"
              placeholder="Enter project order number"
            />
            <InputField
              label="Quotation"
              placeholder="Enter quotation reference"
              value={project.quotationReference || ""}
              onChangeText={(text) => handleChange("quotationReference", text)}
              icon="attach-money"
            />
            <View className="flex-row items-center">
              <InputField
                label="JC Reference"
                placeholder="Enter JC reference"
                value={jcReference || ""}
                onChangeText={(text) => setJcReference(text)}
                icon="receipt"
              />
              <TouchableOpacity
                onPress={() => {
                  if (jcReference) {
                    setProject((prev) => ({
                      ...prev,
                      jcReference: [
                        ...(prev.jcReference || []),
                        { jcReference: jcReference },
                      ],
                    }));
                    setJcReference("");
                  } else {
                    Alert.alert("Error", "Please enter a JC reference");
                  }
                }}
                className="bg-primary rounded-full p-2 ml-4"
              >
                <MaterialIcons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
            {project.jcReference?.length > 0 && (
              <View className="flex-row flex-wrap mb-6">
                {project.jcReference?.map((jc, index) => (
                  <View
                    key={index}
                    className="bg-gray-100 rounded-full p-2 mr-2 mb-2 flex-row items-center"
                  >
                    <Text>{jc.jcReference}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        setProject((prev) => ({
                          ...prev,
                          jcReference: prev.jcReference?.filter(
                            (_, i) => i !== index
                          ),
                        }))
                      }
                      className="ml-2"
                    >
                      <MaterialIcons name="close" size={20} color="#A82F39" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <View className="flex-row items-center">
              <InputField
                label="DC Reference"
                placeholder="Enter DC reference"
                value={dcReference || ""}
                onChangeText={(text) => setDcReference(text)}
                icon="receipt"
              />
              <TouchableOpacity
                onPress={() => {
                  if (dcReference) {
                    setProject((prev) => ({
                      ...prev,
                      dcReference: [
                        ...(prev.dcReference || []),
                        { dcReference: dcReference },
                      ],
                    }));
                    setDcReference("");
                  } else {
                    Alert.alert("Error", "Please enter a DC reference");
                  }
                }}
                className="bg-primary rounded-full p-2 ml-4"
              >
                <MaterialIcons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
            {project.dcReference?.length > 0 && (
              <View className="flex-row flex-wrap mb-6">
                {project.dcReference?.map((dc, index) => (
                  <View
                    key={index}
                    className="bg-gray-100 rounded-full p-2 mr-2 mb-2 flex-row items-center"
                  >
                    <Text>{dc.dcReference}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        setProject((prev) => ({
                          ...prev,
                          dcReference: prev.dcReference?.filter(
                            (_, i) => i !== index
                          ),
                        }))
                      }
                      className="ml-2"
                    >
                      <MaterialIcons name="close" size={20} color="#A82F39" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <InputField
              label="Remarks"
              placeholder="Enter remarks"
              value={project.remarks || ""}
              onChangeText={(text) => handleChange("remarks", text)}
              icon="notes"
            />
            <View className="mb-6">
              <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide mb-4">
                Due Date <Text className="text-gray-400">(Optional)</Text>
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
                      ? new Date(project.dueDate).toDateString()
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
            <View className="mb-6">
              <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide">
                Survey Photos (Max 5){" "}
                <Text className="text-gray-400">(Optional)</Text>
              </Text>
              <PhotosUploader
                addedPhotos={project.surveyPhotos || []}
                onChange={(photos) =>
                  setProject((prev) => ({ ...prev, surveyPhotos: photos }))
                }
                maxPhotos={5}
              />
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
