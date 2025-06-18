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
  const [complaint, setComplaint] = useState<CreateComplaintRequest>({
    clientName: "",
    description: "",
    visitDates: [] as Date[],
    photos: [] as string[],
    quotation: { value: "", isEdited: false },
    po: { value: "", isEdited: false },
    jcReferences: [] as Array<{ value: string; isEdited: boolean }>,
    dcReferences: [] as Array<{ value: string; isEdited: boolean }>,
    remarks: { value: "", isEdited: false },
    complaintReference: "",
    priority: undefined,
    dueDate: undefined,
  });
  const { token } = useAuthStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showVisitDatePicker, setShowVisitDatePicker] = useState(false);
  const [visitDate, setVisitDate] = useState<Date | null>(null);
  const [jcReference, setJcReference] = useState("");
  const [dcReference, setDcReference] = useState("");
  const [loading, setLoading] = useState(false);
  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const showVisitDatePickerModal = () => {
    setShowVisitDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      handleChange("dueDate", selectedDate);
    }
  };

  const handleVisitDateChange = (event: any, selectedDate?: Date) => {
    setShowVisitDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setVisitDate(selectedDate);
    }
  };
  const handleChange = (
    field: keyof CreateComplaintRequest,
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
      await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/complaints`,
        complaint,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert("Success", "Complaint created successfully");
      setComplaint({
        clientName: "",
        description: "",
        visitDates: [],
        photos: [],
        quotation: { value: "", isEdited: false },
        po: { value: "", isEdited: false },
        jcReferences: [],
        dcReferences: [],
        remarks: { value: "", isEdited: false },
        complaintReference: "",
        priority: undefined,
        dueDate: undefined,
      });
      router.back();
    } catch (error: any) {
      console.error(error.response.data.message);
      Alert.alert("Error", "An error occurred while creating the complaint");
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
                      ? new Date(complaint.dueDate).toDateString()
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
            <InputField
              label="Quotation"
              value={complaint.quotation?.value || ""}
              onChangeText={(text) =>
                setComplaint((prev) => ({
                  ...prev,
                  quotation: { value: text, isEdited: false },
                }))
              }
              icon="attach-money"
              placeholder="Enter quotation"
            />
            <InputField
              label="PO Number"
              value={complaint.po?.value || ""}
              onChangeText={(text) =>
                setComplaint((prev) => ({
                  ...prev,
                  po: { value: text, isEdited: false },
                }))
              }
              icon="receipt"
              placeholder="Enter PO number"
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
                    setComplaint((prev) => ({
                      ...prev,
                      jcReferences: [
                        ...(prev.jcReferences || []),
                        { value: jcReference, isEdited: false },
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
            {complaint.jcReferences && complaint.jcReferences.length > 0 && (
              <View className="flex-row flex-wrap mb-6">
                {complaint.jcReferences.map((jc, index) => (
                  <View
                    key={index}
                    className="bg-gray-100 rounded-full p-2 mr-2 mb-2 flex-row items-center"
                  >
                    <Text>{jc.value}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        setComplaint((prev) => ({
                          ...prev,
                          jcReferences: prev.jcReferences?.filter(
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
                    setComplaint((prev) => ({
                      ...prev,
                      dcReferences: [
                        ...(prev.dcReferences || []),
                        { value: dcReference, isEdited: false },
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
            {complaint.dcReferences && complaint.dcReferences.length > 0 && (
              <View className="flex-row flex-wrap mb-6">
                {complaint.dcReferences.map((dc, index) => (
                  <View
                    key={index}
                    className="bg-gray-100 rounded-full p-2 mr-2 mb-2 flex-row items-center"
                  >
                    <Text>{dc.value}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        setComplaint((prev) => ({
                          ...prev,
                          dcReferences: prev.dcReferences?.filter(
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
              value={complaint.remarks?.value || ""}
              onChangeText={(text) =>
                setComplaint((prev) => ({
                  ...prev,
                  remarks: { value: text, isEdited: false },
                }))
              }
              icon="notes"
              placeholder="Enter remarks"
            />
            <View className="mb-6">
              <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide mb-4">
                Visit Dates <Text className="text-gray-400">(Optional)</Text>
              </Text>
              <View className="flex-row items-center">
                {Platform.OS === "android" ? (
                  <TouchableOpacity
                    onPress={showVisitDatePickerModal}
                    className="flex-row items-center bg-white rounded-xl border border-gray-200 p-4"
                  >
                    <MaterialIcons
                      name="event"
                      size={24}
                      color="#6B7280"
                      style={{ marginRight: 10 }}
                    />
                    <Text className="text-black">
                      {visitDate
                        ? new Date(visitDate).toDateString()
                        : "Select visit date"}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {(showVisitDatePicker || Platform.OS === "ios") && (
                  <DateTimePicker
                    value={visitDate || new Date()}
                    mode="date"
                    maximumDate={new Date()}
                    accentColor="#A82F39"
                    onChange={handleVisitDateChange}
                  />
                )}
                <TouchableOpacity
                  onPress={() => {
                    if (visitDate) {
                      setComplaint((prev) => ({
                        ...prev,
                        visitDates: [...(prev.visitDates || []), visitDate],
                      }));
                      setVisitDate(null);
                    } else {
                      Alert.alert("Error", "Please select a visit date");
                    }
                  }}
                  className="bg-primary rounded-full p-2 ml-4"
                >
                  <MaterialIcons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>
              <View className="flex-row flex-wrap mt-4">
                {complaint.visitDates?.map((date, index) => (
                  <View
                    key={index}
                    className="bg-gray-100 rounded-full p-2 mr-2 mb-2 flex-row items-center"
                  >
                    <Text>
                      {new Date(date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setComplaint((prev) => ({
                          ...prev,
                          visitDates: prev.visitDates?.filter(
                            (d) => d !== date
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
