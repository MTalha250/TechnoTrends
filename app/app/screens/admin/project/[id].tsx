import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import InputField from "../../../../components/inputField";
import { Modal, Portal, Button } from "react-native-paper";
import { router } from "expo-router";

const project = {
  id: 1,
  title: "Project Title",
  description: "Project Description",
  clientName: "Client Name",
  clientPhone: "Client Phone",
  status: "Pending", // Change this for testing other statuses
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
    "https://res.cloudinary.com/dewqsghdi/image/upload/v1736707892/Techno/by02wk2bpua5qrfjfl3t.jpg", // Example image URL
  quotationReference: "Q12345",
  quotationImage:
    "https://res.cloudinary.com/dewqsghdi/image/upload/v1736707892/Techno/by02wk2bpua5qrfjfl3t.jpg", // Example image URL
  jcReference: "JC12345",
  jcImage:
    "https://res.cloudinary.com/dewqsghdi/image/upload/v1736707892/Techno/by02wk2bpua5qrfjfl3t.jpg", // Example image URL
  dcReference: "DC12345",
  dcImage:
    "https://res.cloudinary.com/dewqsghdi/image/upload/v1736707892/Techno/by02wk2bpua5qrfjfl3t.jpg", // Example image URL
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

const ProjectDetail = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHead, setSelectedHead] = useState<string | null>(
    project.assignedHead?.id?.toString() || null
  );
  const [remarks, setRemarks] = useState(project.remarks || "");

  const handleAssignHead = () => {
    if (!selectedHead) {
      Alert.alert("Error", "Please select a head to assign");
      return;
    }
    console.log(
      `Assigning Head ID ${selectedHead} to Project ID ${project.id}`
    );
    setModalVisible(false);
  };

  const handleDeassignHead = () => {
    if (project.status === "Completed") {
      Alert.alert(
        "Error",
        "You cannot deassign the head for a completed project."
      );
      return;
    }
    console.log(
      `Deassigning Head ID ${project.assignedHead.id} from Project ID ${project.id}`
    );
    setSelectedHead(null);
  };

  const handleSaveRemarks = () => {
    console.log(`Saving remarks: ${remarks} for Project ID ${project.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 container my-6">
        <View className="flex-row items-center mb-8">
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

        {/* Project Details */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            {project.title}
          </Text>
          <Text className="text-gray-600 mb-2">{project.description}</Text>
          <Text className="text-gray-600 mb-2">
            Client: {project.clientName} ({project.clientPhone})
          </Text>
          <Text className="text-gray-600 mb-2">
            Status: <Text className="font-bold">{project.status}</Text>
          </Text>
          <Text className="text-gray-600 mb-2">
            Due Date:{" "}
            {project.dueDate
              ? new Date(project.dueDate).toLocaleDateString()
              : "Not Set"}
          </Text>

          {/* PO, Quotation, JC, DC */}
          <View className="mb-6">
            <Text className="text-gray-600 mb-2">
              PO Number: {project.poNumber}
            </Text>
            {project.poImage && (
              <Image
                source={{ uri: project.poImage }}
                style={{ width: 150, height: 150, marginBottom: 8 }}
                resizeMode="cover"
              />
            )}
            <Text className="text-gray-600 mb-2">
              Quotation Reference: {project.quotationReference}
            </Text>
            {project.quotationImage && (
              <Image
                source={{ uri: project.quotationImage }}
                style={{ width: 150, height: 150, marginBottom: 8 }}
                resizeMode="cover"
              />
            )}
            <Text className="text-gray-600 mb-2">
              JC Reference: {project.jcReference}
            </Text>
            {project.jcImage && (
              <Image
                source={{ uri: project.jcImage }}
                style={{ width: 150, height: 150, marginBottom: 8 }}
                resizeMode="cover"
              />
            )}
            <Text className="text-gray-600 mb-2">
              DC Reference: {project.dcReference}
            </Text>
            {project.dcImage && (
              <Image
                source={{ uri: project.dcImage }}
                style={{ width: 150, height: 150, marginBottom: 8 }}
                resizeMode="cover"
              />
            )}
          </View>

          {/* Assigned Head */}
          {project.assignedHead ? (
            <>
              <Text className="text-gray-600 mb-2">
                Assigned Head: {project.assignedHead.name}
              </Text>
              {project.status !== "Completed" && (
                <TouchableOpacity
                  onPress={handleDeassignHead}
                  className="bg-red-500 rounded-2xl p-2 justify-center items-center"
                >
                  <Text className="text-white">Deassign Head</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <Text className="text-gray-600 mb-2">No Assigned Head</Text>
          )}

          {/* Assigned Workers */}
          {project.assignedWorkers.length > 0 && (
            <>
              <Text className="text-gray-600 mb-2">Assigned Workers:</Text>
              {project.assignedWorkers.map((worker) => (
                <Text key={worker.id} className="text-gray-600 mb-2">
                  {worker.name}
                </Text>
              ))}
            </>
          )}

          {/* Survey Photos */}
          {project.surveyPhotos.length > 0 && (
            <>
              <Text className="text-gray-600 mb-2">Survey Photos:</Text>
              <ScrollView horizontal>
                {project.surveyPhotos.map((photo, index) => (
                  <Image
                    key={index}
                    source={{ uri: photo }}
                    style={{ width: 150, height: 150, marginRight: 8 }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </>
          )}
        </View>

        {/* Remarks Field (Visible if Project Status is Completed) */}
        {project.status === "Completed" && (
          <View className="bg-white rounded-2xl p-6 shadow-md mb-6">
            <InputField
              label="Remarks"
              value={remarks}
              onChangeText={setRemarks}
              icon="comment"
              required
            />
            <TouchableOpacity
              onPress={handleSaveRemarks}
              className="bg-primary rounded-2xl p-4 justify-center items-center mt-4"
            >
              <Text className="text-lg font-semibold text-white">
                Save Remarks
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Assign Project Button */}
        {project.status !== "Completed" && (
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="bg-primary rounded-2xl p-4 justify-center items-center"
          >
            <Text className="text-lg font-semibold text-white">
              Assign Project
            </Text>
          </TouchableOpacity>
        )}

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
            <Text className="text-lg font-bold mb-4">Assign Project</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProjectDetail;
