import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  Image,
  Modal as RNModal,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { Modal, Portal, Button } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";
import InputField from "@/components/inputField";
import DateTimePicker from "@react-native-community/datetimepicker";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-teal-500",
  ];
  const index = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

const ComplaintDetail = () => {
  const { id } = useLocalSearchParams();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [heads, setHeads] = useState<Head[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedHead, setSelectedHead] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      handleFieldChange("dueDate", selectedDate.toISOString());
    }
  };

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Complaint>(
        `${process.env.EXPO_PUBLIC_API_URL}/complaints/${id}`
      );
      setComplaint(response.data);
      if (response.data.assignedHead) {
        setSelectedHead(response.data.head.id.toString());
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch complaint details");
    } finally {
      setLoading(false);
    }
  };

  const fetchHeads = async () => {
    try {
      const response = await axios.get<Head[]>(
        `${process.env.EXPO_PUBLIC_API_URL}/head`
      );
      setHeads(response.data);
    } catch (error) {
      console.error("Error fetching heads:", error);
    }
  };

  useEffect(() => {
    fetchComplaint();
    fetchHeads();
  }, [id]);

  const handleSaveChanges = async () => {
    if (
      !complaint?.title ||
      !complaint?.description ||
      !complaint?.clientName ||
      !complaint?.clientPhone ||
      !complaint?.dueDate ||
      !complaint?.complaintReference ||
      !complaint?.priority
    ) {
      Alert.alert("Error", "Please fill all the fields");
      return;
    }
    try {
      setSaving(true);
      await axios.put(`${process.env.EXPO_PUBLIC_API_URL}/complaints/${id}`, {
        title: complaint?.title,
        description: complaint?.description,
        clientName: complaint?.clientName,
        clientPhone: complaint?.clientPhone,
        dueDate: complaint?.dueDate,
        complaintReference: complaint?.complaintReference,
        priority: complaint?.priority,
      });
      Alert.alert("Success", "Complaint updated successfully");
      setEditMode(false);
      fetchComplaint();
    } catch (error) {
      Alert.alert("Error", "Failed to update complaint");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignHead = async () => {
    if (!selectedHead) return;

    try {
      await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/complaints/${id}/assign-head`,
        { head_id: selectedHead }
      );
      Alert.alert("Success", "Head assigned successfully");
      setModalVisible(false);
      fetchComplaint();
    } catch (error) {
      Alert.alert("Error", "Failed to assign head");
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setComplaint((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  // Components
  const Avatar = ({
    name,
    size = "medium",
  }: {
    name: string;
    size?: "small" | "medium" | "large";
  }) => {
    const initials = getInitials(name);
    const backgroundColor = getAvatarColor(name);
    const sizeClasses = {
      small: "w-8 h-8 text-sm",
      medium: "w-12 h-12 text-base",
      large: "w-16 h-16 text-lg",
    };

    return (
      <View
        className={`${backgroundColor} ${sizeClasses[size]} rounded-full items-center justify-center`}
      >
        <Text className="text-white font-semibold">{initials}</Text>
      </View>
    );
  };

  const ImageViewerModal = ({
    visible,
    imageUrl,
    onClose,
  }: {
    visible: boolean;
    imageUrl: string;
    onClose: () => void;
  }) => (
    <RNModal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        <TouchableOpacity
          onPress={onClose}
          className="absolute top-12 right-4 z-10 p-2 bg-black/50 rounded-full"
        >
          <MaterialIcons name="close" size={24} color="white" />
        </TouchableOpacity>

        <View className="flex-1 items-center justify-center">
          <Image
            source={{ uri: imageUrl }}
            style={{ width: screenWidth, height: screenHeight * 0.8 }}
            resizeMode="contain"
          />
        </View>
      </View>
    </RNModal>
  );

  const ImageThumbnail = ({
    imageUrl,
    label,
    size = "full",
  }: {
    imageUrl: string;
    label?: string;
    size?: "full" | "thumbnail";
  }) => {
    const sizeClasses = {
      full: "w-full h-48",
      thumbnail: "w-32 h-32",
    };

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedImage(imageUrl);
          setImageModalVisible(true);
        }}
        className={`relative ${size === "thumbnail" ? "mr-2" : "mb-4"}`}
      >
        {label && <Text className="font-medium mb-2">{label}:</Text>}
        <Image
          source={{ uri: imageUrl }}
          className={`${sizeClasses[size]} rounded-lg`}
          resizeMode="cover"
        />
        <View className="absolute bottom-2 right-2 bg-black/50 rounded-full p-2">
          <MaterialIcons name="fullscreen" size={20} color="white" />
        </View>
      </TouchableOpacity>
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "low":
        return "bg-green-200 text-green-800";
      case "medium":
        return "bg-yellow-200 text-yellow-800";
      case "high":
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-200 text-yellow-800";
      case "in progress":
        return "bg-blue-200 text-blue-800";
      case "resolved":
        return "bg-green-200 text-green-800";
      case "closed":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  // Section Components
  const AssignedPersonnelSection = () => (
    <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
      <Text className="text-lg font-bold mb-4">Assigned Personnel</Text>

      {/* Assigned Head */}
      <View className="mb-6">
        <Text className="font-medium mb-3">Head:</Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Avatar
              name={complaint?.head?.name || "Not Assigned"}
              size="medium"
            />
            <View className="ml-3">
              <Text className="font-semibold">
                {complaint?.head?.name || "Not assigned"}
              </Text>
              <Text className="text-gray-500 text-sm">Complaint Head</Text>
            </View>
          </View>
          {complaint?.status !== "Closed" && (
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="bg-primary px-4 py-2 rounded-lg"
            >
              <Text className="text-white">Change Head</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Assigned Workers */}
      {complaint?.assignedWorkers && complaint.assignedWorkers.length > 0 && (
        <View>
          <Text className="font-medium mb-3">Workers:</Text>
          <View className="gap-4">
            {complaint?.assignedWorkers.map((worker) => (
              <View key={worker.id} className="flex-row items-center">
                <Avatar name={worker.name} size="medium" />
                <View className="ml-3">
                  <Text className="font-semibold">{worker.name}</Text>
                  <Text className="text-gray-500 text-sm">Worker</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const ImagesSection = () => (
    <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
      <Text className="text-lg font-bold mb-4">Complaint Documents</Text>

      {[
        { label: "Complaint Image", image: complaint?.complaintImage },
        { label: "JC Image", image: complaint?.jcImage },
      ].map(
        (doc, index) =>
          doc.image && (
            <ImageThumbnail
              key={index}
              imageUrl={doc.image || ""}
              label={doc.label}
              size="full"
            />
          )
      )}

      {complaint?.photos && (
        <>
          <Text className="font-medium mb-2">Additional Photos:</Text>
          <ScrollView horizontal className="gap-4">
            {complaint?.photos.map((photo, index) => (
              <ImageThumbnail key={index} imageUrl={photo} size="thumbnail" />
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#A82F39" />
      </View>
    );
  }

  if (!complaint) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-600 text-center mb-4">
          {"Complaint not found"}
        </Text>
        <Button mode="contained" onPress={fetchComplaint}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 container my-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-white p-2 rounded-full shadow-sm mr-4"
            >
              <MaterialIcons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-gray-800">
                Complaint Details
              </Text>
              <Text className="text-gray-600">
                View details of the selected complaint
              </Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            <View
              className={`px-3 py-1 rounded-full ${getStatusColor(
                complaint.status
              )}`}
            >
              <Text className="font-medium">{complaint.status}</Text>
            </View>
          </View>
        </View>

        {/* Edit/Save Button */}
        <TouchableOpacity
          onPress={() => {
            if (editMode) {
              handleSaveChanges();
            } else {
              setEditMode(true);
            }
          }}
          disabled={saving}
          className={`mb-4 p-3 rounded-xl ${
            editMode ? "bg-green-600" : "bg-primary"
          } ${saving ? "opacity-50" : ""}`}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold">
              {editMode ? "Save Changes" : "Edit Complaint"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Complaint Details Form */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <InputField
            label="Complaint Title"
            value={complaint.title || ""}
            icon="title"
            onChangeText={(value) => handleFieldChange("title", value)}
            readonly={!editMode}
            placeholder="Enter complaint title"
          />
          <InputField
            label="Description"
            value={complaint.description || ""}
            icon="description"
            onChangeText={(value) => handleFieldChange("description", value)}
            readonly={!editMode}
            placeholder="Enter complaint description"
          />
          <InputField
            label="Client Name"
            value={complaint.clientName || ""}
            icon="person"
            onChangeText={(value) => handleFieldChange("clientName", value)}
            readonly={!editMode}
            placeholder="Enter client name"
          />
          <InputField
            label="Client Phone"
            value={complaint.clientPhone || ""}
            icon="phone"
            onChangeText={(value) => handleFieldChange("clientPhone", value)}
            readonly={!editMode}
            placeholder="Enter client phone"
          />
          <InputField
            label="Complaint Reference"
            value={complaint.complaintReference || ""}
            icon="bookmark"
            onChangeText={(value) =>
              handleFieldChange("complaintReference", value)
            }
            readonly={!editMode}
            placeholder="Enter complaint reference"
          />
          {!editMode ? (
            <InputField
              label="Due Date"
              value={
                complaint.dueDate
                  ? new Date(complaint.dueDate).toDateString()
                  : ""
              }
              icon="event"
              readonly
              placeholder="Select due date"
            />
          ) : (
            <View className="mb-6">
              <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide mb-4">
                Due Date
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
                      ? new Date(complaint.dueDate).toLocaleDateString()
                      : "Select due date"}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {(showDatePicker || Platform.OS === "ios") && (
                <DateTimePicker
                  value={
                    complaint.dueDate ? new Date(complaint.dueDate) : new Date()
                  }
                  mode="date"
                  minimumDate={new Date()}
                  accentColor="#A82F39"
                  onChange={handleDateChange}
                />
              )}
            </View>
          )}
          {editMode && (
            <View className="mb-6">
              <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide mb-4">
                Priority
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
                data={[
                  { label: "Low", value: "Low" },
                  { label: "Medium", value: "Medium" },
                  { label: "High", value: "High" },
                ]}
                labelField="label"
                valueField="value"
                placeholder="Select Priority"
                value={complaint.priority}
                onChange={(item) => handleFieldChange("priority", item.value)}
              />
            </View>
          )}
          <InputField
            label="JC Reference"
            value={complaint.jcReference || ""}
            icon="work"
            readonly
            placeholder="JC reference"
          />
          <InputField
            label="Remarks"
            value={complaint.remarks || ""}
            icon="comment"
            readonly
            placeholder="Remarks"
          />
        </View>

        {/* Assigned Personnel Section */}
        <AssignedPersonnelSection />

        {/* Images Section */}
        <ImagesSection />

        {/* Assign Head Modal */}
        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
            contentContainerStyle={{
              backgroundColor: "white",
              padding: 20,
              marginHorizontal: 20,
              borderRadius: 12,
            }}
          >
            <Text className="text-lg font-bold mb-4">
              Assign Complaint Head
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
              data={heads.map((head) => ({
                label: head.name,
                value: head.id.toString(),
              }))}
              labelField="label"
              valueField="value"
              placeholder="Select Head"
              value={selectedHead}
              onChange={(item) => setSelectedHead(item.value)}
            />
            <View className="flex-row mt-6 gap-4">
              <Button
                onPress={() => setModalVisible(false)}
                mode="outlined"
                style={{ flex: 1 }}
                textColor="#374151"
              >
                Cancel
              </Button>
              <Button
                onPress={handleAssignHead}
                mode="contained"
                style={{ flex: 1, backgroundColor: "#A82F39" }}
              >
                Assign
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* Full Screen Image Modal */}
        <ImageViewerModal
          visible={imageModalVisible}
          imageUrl={selectedImage || ""}
          onClose={() => {
            setImageModalVisible(false);
            setSelectedImage(null);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ComplaintDetail;
