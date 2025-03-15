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
import PhotosUploader from "@/components/uploader";

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

const ProjectDetail = () => {
  const { id } = useLocalSearchParams();
  const [project, setProject] = useState<Project | null>(null);
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

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Project>(
        `${process.env.EXPO_PUBLIC_API_URL}/projects/${id}`
      );
      setProject(response.data);
      if (response.data.head) {
        setSelectedHead(response.data.head.id.toString());
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch project details");
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
    fetchProject();
    fetchHeads();
  }, [id]);

  const handleSaveChanges = async () => {
    if (!project?.clientName) {
      Alert.alert("Error", "Client name is required");
      return;
    }
    try {
      setSaving(true);
      await axios.put(`${process.env.EXPO_PUBLIC_API_URL}/projects/${id}`, {
        clientName: project?.clientName,
        description: project?.description,
        poNumber: project?.poNumber,
        quotationReference: project?.quotationReference,
        jcReference: project?.jcReference,
        dcReference: project?.dcReference,
        remarks: project?.remarks,
        dueDate: project?.dueDate,
        surveyPhotos: project?.surveyPhotos,
      });
      Alert.alert("Success", "Project updated successfully");
      setEditMode(false);
      fetchProject();
    } catch (error) {
      console.log("Error updating project", error);
      Alert.alert("Error", "Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  // Assign head
  const handleAssignHead = async () => {
    if (!selectedHead) return;

    try {
      await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/projects/${id}/assign-head`,
        { head_id: selectedHead }
      );
      Alert.alert("Success", "Head assigned successfully");
      setModalVisible(false);
      fetchProject();
    } catch (error) {
      Alert.alert("Error", "Failed to assign head");
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setProject((prev) => {
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

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-200 text-yellow-800";
      case "completed":
        return "bg-green-200 text-green-800";
      case "in progress":
        return "bg-blue-200 text-blue-800";
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
              name={project?.head?.name || "Not Assigned"}
              size="medium"
            />
            <View className="ml-3">
              <Text className="font-semibold">
                {project?.head?.name || "Not assigned"}
              </Text>
              <Text className="text-gray-500 text-sm">Project Head</Text>
            </View>
          </View>
          {project?.status !== "Completed" && (
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
      {project?.users && project.users.length > 0 && (
        <View>
          <Text className="font-medium mb-3">Workers:</Text>
          <View className="gap-4">
            {project?.users.map((worker) => (
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
      <Text className="text-lg font-bold mb-4">Survey Photos</Text>
      {editMode ? (
        <PhotosUploader
          maxPhotos={5}
          addedPhotos={project?.surveyPhotos || []}
          onChange={(photos) =>
            setProject((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                surveyPhotos: photos,
              };
            })
          }
        />
      ) : (
        <ScrollView horizontal className="gap-4">
          {project?.surveyPhotos?.map((photo, index) => (
            <ImageThumbnail key={index} imageUrl={photo} size="thumbnail" />
          ))}
        </ScrollView>
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

  if (!project) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-600 text-center mb-4">
          {"Project not found"}
        </Text>
        <Button mode="contained" onPress={fetchProject}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
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
                Project Details
              </Text>
              <Text className="text-gray-600">
                View details of the selected project
              </Text>
            </View>
          </View>
          <View
            className={`px-3 py-1 rounded-full ${getStatusColor(
              project.status
            )}`}
          >
            <Text className="font-medium">{project.status}</Text>
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
              {editMode ? "Save Changes" : "Edit Project"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Project Details Form */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <InputField
            label="Client"
            value={project.clientName || ""}
            icon="person"
            onChangeText={(value) => handleFieldChange("clientName", value)}
            readonly={!editMode}
            placeholder="Enter client name"
            required
          />
          <InputField
            label="Project Description"
            value={project.description || ""}
            icon="description"
            placeholder="Enter project description"
            onChangeText={(value) => handleFieldChange("description", value)}
            readonly={!editMode}
          />

          <InputField
            label="PO Number"
            value={project.poNumber || ""}
            icon="receipt"
            onChangeText={(value) => handleFieldChange("poNumber", value)}
            readonly={!editMode}
            placeholder="Enter PO number"
          />
          <InputField
            label="Quotation"
            value={project.quotationReference || ""}
            icon="attach-money"
            onChangeText={(value) =>
              handleFieldChange("quotationReference", value)
            }
            readonly={!editMode}
            placeholder="Enter quotation reference"
          />
          <InputField
            label="JC Reference"
            value={project.jcReference || ""}
            icon="receipt"
            onChangeText={(value) => handleFieldChange("jcReference", value)}
            readonly={!editMode}
            placeholder="Enter JC reference"
          />
          <InputField
            label="DC Reference"
            value={project.dcReference || ""}
            icon="receipt"
            onChangeText={(value) => handleFieldChange("dcReference", value)}
            readonly={!editMode}
            placeholder="Enter DC reference"
          />
          <InputField
            label="Remarks"
            value={project.remarks || ""}
            icon="notes"
            onChangeText={(value) => handleFieldChange("remarks", value)}
            readonly={!editMode}
            placeholder="Enter remarks"
          />
          {!editMode ? (
            <InputField
              label="Due Date"
              value={
                project.dueDate ? new Date(project.dueDate).toDateString() : ""
              }
              icon="event"
              onChangeText={(value) => handleFieldChange("dueDate", value)}
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
                    {project.dueDate
                      ? new Date(project.dueDate).toDateString()
                      : "Select due date"}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {(showDatePicker || Platform.OS === "ios") && (
                <DateTimePicker
                  value={
                    project.dueDate ? new Date(project.dueDate) : new Date()
                  }
                  mode="date"
                  minimumDate={new Date()}
                  accentColor="#A82F39"
                  onChange={handleDateChange}
                />
              )}
            </View>
          )}
        </View>
        <AssignedPersonnelSection />
        <ImagesSection />
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
            <Text className="text-lg font-bold mb-4">Assign Project Head</Text>
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
                onPress={() => {
                  handleAssignHead();
                }}
                mode="contained"
                style={{ flex: 1, backgroundColor: "#A82F39" }}
              >
                Assign
              </Button>
            </View>
          </Modal>
        </Portal>
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

export default ProjectDetail;
