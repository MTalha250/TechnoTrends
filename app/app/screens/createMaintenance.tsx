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
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import useAuthStore from "@/store/authStore";
import { ActivityIndicator } from "react-native-paper";

const CreateMaintenance = () => {
  const [maintenance, setMaintenance] = useState<CreateMaintenanceRequest>({
    clientName: "",
    remarks: { value: "", isEdited: false },
    serviceDates: [],
  });
  const { token } = useAuthStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedServiceDate, setSelectedServiceDate] = useState<Date>(
    new Date()
  );
  const [loading, setLoading] = useState(false);

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setSelectedServiceDate(selectedDate);
    }
  };

  const handleChange = (
    field: keyof CreateMaintenanceRequest,
    value: string | Date | null
  ) => {
    setMaintenance((prev) => ({ ...prev, [field]: value }));
  };

  const addServiceDate = () => {
    const newServiceDate = {
      serviceDate: selectedServiceDate,
      actualDate: null,
      jcReference: "",
      invoiceRef: "",
      paymentStatus: "Pending" as const,
      isCompleted: false,
      month: selectedServiceDate.getMonth() + 1,
      year: selectedServiceDate.getFullYear(),
    };

    setMaintenance((prev) => ({
      ...prev,
      serviceDates: [...(prev.serviceDates || []), newServiceDate],
    }));
    setSelectedServiceDate(new Date());
  };

  const removeServiceDate = (index: number) => {
    setMaintenance((prev) => ({
      ...prev,
      serviceDates: prev.serviceDates?.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!maintenance.clientName) {
      Alert.alert("Error", "Client name is required");
      return;
    }

    if (!maintenance.serviceDates || maintenance.serviceDates.length === 0) {
      Alert.alert("Error", "At least one service date is required");
      return;
    }

    console.log(maintenance);
    try {
      setLoading(true);
      await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/maintenances`,
        maintenance,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert("Success", "Maintenance created successfully");
      setMaintenance({
        clientName: "",
        remarks: { value: "", isEdited: false },
        serviceDates: [],
      });
      router.back();
    } catch (error) {
      console.error("Error creating maintenance", error);
      Alert.alert("Error", "An error occurred while creating the maintenance");
      return;
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
              <Text className="text-2xl font-bold">Create Maintenance</Text>
              <Text className="text-gray-600">
                Add a new maintenance schedule
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <InputField
              label="Client"
              value={maintenance.clientName || ""}
              onChangeText={(text) => handleChange("clientName", text)}
              icon="person"
              placeholder="Enter client name"
              required
            />

            <InputField
              label="Remarks"
              value={maintenance.remarks?.value || ""}
              onChangeText={(text) =>
                setMaintenance((prev) => ({
                  ...prev,
                  remarks: { value: text, isEdited: false },
                }))
              }
              icon="note"
              placeholder="Enter maintenance remarks"
            />

            {/* Service Dates - match Create Complaint visit dates design */}
            <View className="mb-6">
              <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide mb-4">
                Service Dates
              </Text>

              <View className="flex-row items-center">
                {Platform.OS === "android" ? (
                  <TouchableOpacity
                    onPress={showDatePickerModal}
                    className="flex-row items-center bg-white rounded-xl border border-gray-200 p-4 flex-1"
                  >
                    <MaterialIcons
                      name="event"
                      size={24}
                      color="#6B7280"
                      style={{ marginRight: 10 }}
                    />
                    <Text className="text-black">
                      {selectedServiceDate
                        ? new Date(selectedServiceDate).toDateString()
                        : "Select service date"}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {(showDatePicker || Platform.OS === "ios") && (
                  <DateTimePicker
                    value={selectedServiceDate}
                    mode="date"
                    minimumDate={new Date()}
                    accentColor="#A82F39"
                    onChange={handleDateChange}
                  />
                )}

                <TouchableOpacity
                  onPress={addServiceDate}
                  className="bg-primary rounded-full p-2 ml-4"
                >
                  <MaterialIcons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap mt-4">
                {maintenance.serviceDates?.map((serviceDate, index) => (
                  <View
                    key={index}
                    className="bg-gray-100 rounded-full p-2 mr-2 mb-2 flex-row items-center"
                  >
                    <Text>
                      {new Date(serviceDate.serviceDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeServiceDate(index)}
                      className="ml-2"
                    >
                      <MaterialIcons name="close" size={20} color="#A82F39" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </View>
          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`bg-primary rounded-2xl py-4 flex-row items-center justify-center ${
              loading ? "opacity-50" : ""
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialIcons name="add" size={24} color="white" />
                <Text className="text-white font-semibold text-lg ml-2">
                  Create Maintenance
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateMaintenance;
