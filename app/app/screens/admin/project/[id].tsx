import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  Image,
  Modal as RNModal,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import InputField from "@/components/inputField";
import { Modal, Portal, Button } from "react-native-paper";
import { router } from "expo-router";

const project = {
  id: 1,
  title: "Project Title",
  description: "Project Description",
  clientName: "Client Name",
  clientPhone: "Client Phone",
  status: "Completed",
  dueDate: new Date().toISOString(),
  assignedHead: {
    id: 1,
    name: "Head Name",
  },
  remarks: "Remarks",
  assignedWorkers: [
    { id: 1, name: "Worker 1" },
    { id: 2, name: "Worker 2" },
  ],
  poNumber: "PO12345",
  poImage:
    "https://res.cloudinary.com/dewqsghdi/image/upload/v1736707892/Techno/by02wk2bpua5qrfjfl3t.jpg",
  quotationReference: "Q12345",
  quotationImage:
    "https://res.cloudinary.com/dewqsghdi/image/upload/v1736707892/Techno/by02wk2bpua5qrfjfl3t.jpg",
  jcReference: "JC12345",
  jcImage:
    "https://res.cloudinary.com/dewqsghdi/image/upload/v1736707892/Techno/by02wk2bpua5qrfjfl3t.jpg",
  dcReference: "DC12345",
  dcImage:
    "https://res.cloudinary.com/dewqsghdi/image/upload/v1736707892/Techno/by02wk2bpua5qrfjfl3t.jpg",
  surveyPhotos: [
    "https://res.cloudinary.com/dewqsghdi/image/upload/v1736707892/Techno/by02wk2bpua5qrfjfl3t.jpg",
    "https://res.cloudinary.com/dewqsghdi/image/upload/v1736707892/Techno/by02wk2bpua5qrfjfl3t.jpg",
  ],
};

const heads = [
  { id: 1, name: "Head 1" },
  { id: 2, name: "Head 2" },
  { id: 3, name: "Head 3" },
];

// Utility functions
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
  // State management
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedHead, setSelectedHead] = useState(
    project.assignedHead?.id?.toString() || null
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description,
    clientName: project.clientName,
    clientPhone: project.clientPhone,
    dueDate: project.dueDate,
    remarks: project.remarks,
    poNumber: project.poNumber,
    quotationReference: project.quotationReference,
    jcReference: project.jcReference,
    dcReference: project.dcReference,
  });

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

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

  const handleSaveChanges = () => {
    console.log("Saving changes:", formData);
    setEditMode(false);
    Alert.alert("Success", "Changes saved successfully");
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
              name={project.assignedHead?.name || "Not Assigned"}
              size="medium"
            />
            <View className="ml-3">
              <Text className="font-semibold">
                {project.assignedHead?.name || "Not assigned"}
              </Text>
              <Text className="text-gray-500 text-sm">Project Head</Text>
            </View>
          </View>
          {project.status !== "Completed" && (
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
      <View>
        <Text className="font-medium mb-3">Workers:</Text>
        <View className="gap-4">
          {project.assignedWorkers.map((worker) => (
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
    </View>
  );

  const ImagesSection = () => (
    <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
      <Text className="text-lg font-bold mb-4">Project Documents</Text>

      {/* Document Images */}
      {[
        { label: "PO Image", image: project.poImage },
        { label: "Quotation Image", image: project.quotationImage },
        { label: "JC Image", image: project.jcImage },
        { label: "DC Image", image: project.dcImage },
      ].map((doc, index) => (
        <ImageThumbnail
          key={index}
          imageUrl={doc.image}
          label={doc.label}
          size="full"
        />
      ))}

      {/* Survey Photos */}
      <Text className="font-medium mb-2">Survey Photos:</Text>
      <ScrollView horizontal className="gap-4">
        {project.surveyPhotos.map((photo, index) => (
          <ImageThumbnail key={index} imageUrl={photo} size="thumbnail" />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 container my-6">
        {/* Header with Back Button and Status Badge */}
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
          onPress={() => (editMode ? handleSaveChanges() : setEditMode(true))}
          className={`mb-4 p-3 rounded-xl ${
            editMode ? "bg-green-600" : "bg-primary"
          }`}
        >
          <Text className="text-white text-center font-semibold">
            {editMode ? "Save Changes" : "Edit Project"}
          </Text>
        </TouchableOpacity>

        {/* Project Details Form */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <InputField
            label="Project Title"
            value={formData.title}
            icon="title"
            onChangeText={(value) => handleFieldChange("title", value)}
            readonly={!editMode}
          />
          <InputField
            label="Description"
            value={formData.description}
            icon="description"
            onChangeText={(value) => handleFieldChange("description", value)}
            readonly={!editMode}
          />
          <InputField
            label="Client Name"
            value={formData.clientName}
            icon="person"
            onChangeText={(value) => handleFieldChange("clientName", value)}
            readonly={!editMode}
          />
          <InputField
            label="Client Phone"
            value={formData.clientPhone}
            icon="phone"
            onChangeText={(value) => handleFieldChange("clientPhone", value)}
            readonly={!editMode}
          />
          <InputField
            label="Due Date"
            value={new Date(formData.dueDate).toDateString()}
            icon="event"
            onChangeText={(value) => handleFieldChange("dueDate", value)}
            readonly={!editMode}
          />
          <InputField
            label="PO Number"
            value={formData.poNumber}
            icon="assignment"
            onChangeText={(value) => handleFieldChange("poNumber", value)}
            readonly={!editMode}
          />
          <InputField
            label="Quotation Reference"
            value={formData.quotationReference}
            icon="description"
            onChangeText={(value) =>
              handleFieldChange("quotationReference", value)
            }
            readonly={!editMode}
          />
          <InputField
            label="JC Reference"
            value={formData.jcReference}
            icon="work"
            onChangeText={(value) => handleFieldChange("jcReference", value)}
            readonly={!editMode}
          />
          <InputField
            label="DC Reference"
            value={formData.dcReference}
            icon="description"
            onChangeText={(value) => handleFieldChange("dcReference", value)}
            readonly={!editMode}
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
                  Alert.alert("Success", "Head assigned successfully");
                  setModalVisible(false);
                }}
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

export default ProjectDetail;
