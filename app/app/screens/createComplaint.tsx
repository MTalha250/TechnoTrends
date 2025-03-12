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
import InputField from "@/components/inputField";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import PhotosUploader from "@/components/uploader";
import axios from "axios";
import useAuthStore from "@/store/authStore";
import { ActivityIndicator } from "react-native-paper";

const priorities = [
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
];

const CreateComplaint = () => {
  const [complaint, setComplaint] = useState<Partial<Complaint>>({
    clientName: "",
    description: "",
    visitDates: [],
    photos: [],
    quotation: "",
    poNumber: "",
    jcReference: "",
    dcReference: "",
    remarks: "",
    complaintReference: "",
    priority: undefined,
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

  const handleChange = (
    field: keyof Complaint,
    value: string | Date | null
  ) => {
    setComplaint((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!complaint.clientName || !complaint.priority || !complaint.dueDate) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/complaints`, {
        ...complaint,
        assignedBy: user?.id,
        status: "Pending",
      });
      Alert.alert("Success", "Complaint created successfully");
      setComplaint({
        clientName: "",
        description: "",
        visitDates: [],
        photos: [],
        quotation: "",
        poNumber: "",
        jcReference: "",
        dcReference: "",
        remarks: "",
        complaintReference: "",
        priority: undefined,
        dueDate: null,
      });
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred while creating the complaint");
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
              <Text className="text-2xl font-bold">Create Complaint</Text>
              <Text className="text-gray-600">
                Add a new complaint to your list
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <InputField
              label="Client"
              value={complaint.clientName || ""}
              onChangeText={(text) => handleChange("clientName", text)}
              icon="person"
              placeholder="Enter client name"
              required
            />
            <InputField
              label="Complaint Description"
              value={complaint.description || ""}
              onChangeText={(text) => handleChange("description", text)}
              icon="description"
              placeholder="Enter complaint description"
            />
            <InputField
              label="Complaint Reference"
              value={complaint.complaintReference || ""}
              onChangeText={(text) => handleChange("complaintReference", text)}
              icon="bookmark"
              placeholder="Enter complaint reference"
            />
            <View className="mb-6">
              <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide mb-2">
                Priority <Text className="text-red-500">*</Text>
              </Text>
              <View className="flex-row items-center bg-white rounded-xl border border-gray-200 p-4">
                <MaterialIcons
                  name="priority-high"
                  size={24}
                  color="#6B7280"
                  style={{ marginRight: 10 }}
                />
                <Dropdown
                  style={{
                    flex: 1,
                    padding: 0,
                    backgroundColor: "transparent",
                  }}
                  placeholderStyle={{ color: "#9CA3AF" }}
                  data={priorities}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Priority"
                  value={complaint.priority}
                  onChange={(item) => handleChange("priority", item.value)}
                />
              </View>
            </View>
            <View className="mb-6">
              <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide">
                Photos (Max 5) <Text className="text-gray-400">(Optional)</Text>
              </Text>
              <PhotosUploader
                addedPhotos={complaint.photos || []}
                onChange={(photos) =>
                  setComplaint((prev) => ({
                    ...prev,
                    photos: photos,
                  }))
                }
                maxPhotos={5}
              />
            </View>
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
                    {complaint.dueDate
                      ? complaint.dueDate.toLocaleDateString()
                      : "Select due date"}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {(showDatePicker || Platform.OS === "ios") && (
                <DateTimePicker
                  value={complaint.dueDate || new Date()}
                  mode="date"
                  minimumDate={new Date()}
                  accentColor="#A82F39"
                  onChange={handleDateChange}
                />
              )}
            </View>
          </View>

          {/* Submit Button */}
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
                Create Complaint
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateComplaint;
