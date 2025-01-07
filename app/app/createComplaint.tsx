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
import InputField from "../components/inputField";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";

interface Complaint {
  title: string;
  description: string;
  selectedProject: string;
  priority: string;
  dueDate: Date | null;
}

const projects = [
  { label: "Project A", value: "projectA" },
  { label: "Project B", value: "projectB" },
  { label: "Project C", value: "projectC" },
];

const priorities = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

const CreateComplaint = () => {
  const [complaint, setComplaint] = useState<Complaint>({
    title: "",
    description: "",
    selectedProject: "",
    priority: "",
    dueDate: null,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const handleSubmit = () => {
    if (
      !complaint.title ||
      !complaint.description ||
      !complaint.selectedProject ||
      !complaint.priority ||
      !complaint.dueDate
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    console.log("Creating complaint:", complaint);
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
            <Text className="text-2xl font-bold">Create Complaint</Text>
            <Text className="text-gray-600">
              Add a new complaint to your list
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <InputField
            label="Complaint Title"
            value={complaint.title}
            onChangeText={(text) => handleChange("title", text)}
            icon="title"
            required
          />

          <InputField
            label="Complaint Description"
            value={complaint.description}
            onChangeText={(text) => handleChange("description", text)}
            icon="description"
            required
          />
          <View className="mb-6">
            <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide mb-2">
              Select Project <Text className="text-red-500">*</Text>
            </Text>
            <Dropdown
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                borderColor: "#ddd",
                borderWidth: 1,
                padding: 14,
              }}
              placeholderStyle={{ color: "#6b7280" }}
              selectedTextStyle={{ color: "#374151" }}
              data={projects}
              labelField="label"
              valueField="value"
              placeholder="Select Project"
              value={complaint.selectedProject}
              onChange={(item) => handleChange("selectedProject", item.value)}
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide mb-2">
              Priority <Text className="text-red-500">*</Text>
            </Text>
            <Dropdown
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                borderColor: "#ddd",
                borderWidth: 1,
                padding: 14,
              }}
              placeholderStyle={{ color: "#6b7280" }}
              selectedTextStyle={{ color: "#374151" }}
              data={priorities}
              labelField="label"
              valueField="value"
              placeholder="Select Priority"
              value={complaint.priority}
              onChange={(item) => handleChange("priority", item.value)}
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

        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-primary rounded-2xl p-4 justify-center items-center"
        >
          <Text className="text-lg font-semibold text-white">
            Create Complaint
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateComplaint;
