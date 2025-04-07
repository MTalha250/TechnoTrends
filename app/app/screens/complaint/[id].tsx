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
import useAuthStore from "@/store/authStore";

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
  const [modalVisible, setModalVisible] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [userIds, setUserIds] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedHead, setSelectedHead] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showVisitDatePicker, setShowVisitDatePicker] = useState(false);
  const [visitDate, setVisitDate] = useState<Date | null>(null);
  const [jcReference, setJcReference] = useState("");
  const [dcReference, setDcReference] = useState("");
  const { role } = useAuthStore();
  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };
  const showVisitDatePickerModal = () => {
    setShowVisitDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      handleFieldChange("dueDate", selectedDate.toISOString());
    }
  };

  const handleVisitDateChange = (event: any, selectedDate?: Date) => {
    setShowVisitDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setVisitDate(selectedDate);
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
      const response2 = await axios.get<User[]>(
        `${process.env.EXPO_PUBLIC_API_URL}/user`
      );
      setUsers(response2.data);
      setUserIds(response.data.users.map((user) => user.id.toString()));
    } catch (error) {
      Alert.alert("Error", "Failed to fetch complaint details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleSaveChanges = async () => {
    if (!complaint?.clientName || !complaint?.dueDate || !complaint?.priority) {
      Alert.alert("Error", "Please fill all the fields");
      return;
    }
    try {
      setSaving(true);
      await axios.put(`${process.env.EXPO_PUBLIC_API_URL}/complaints/${id}`, {
        clientName: complaint?.clientName,
        description: complaint?.description,
        visitDates: complaint?.visitDates,
        dueDate: complaint?.dueDate,
        complaintReference: complaint?.complaintReference,
        priority: complaint?.priority,
        photos: complaint?.photos,
        poNumber: complaint?.poNumber,
        remarks: complaint?.remarks,
        dcReference: complaint?.dcReferences,
        jcReference: complaint?.jcReferences,
        quotation: complaint?.quotation,
      });
      Alert.alert("Success", "Complaint updated successfully");
      setEditMode(false);
      fetchComplaint();
    } catch (error) {
      Alert.alert("Error", "Failed to update complaint");
      console.log("Error saving complaint:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAssignUsers = async () => {
    try {
      await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/complaints/${id}/assign-workers`,
        { worker_ids: userIds }
      );
      Alert.alert("Success", "Users updated successfully");
      setModalVisible(false);
      fetchComplaint();
    } catch (error) {
      console.log("Error assigning users", error);
      Alert.alert("Error", "Failed to assign users");
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
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold">Assigned Workers</Text>
        <TouchableOpacity
          onPress={() => {
            setUserIds(
              complaint?.users.map((user) => user.id.toString()) || []
            );
            setModalVisible(true);
          }}
          className="bg-primary px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Edit</Text>
        </TouchableOpacity>
      </View>
      {complaint?.users && complaint.users.length > 0 ? (
        <View>
          <View className="gap-4">
            {complaint?.users.map((worker) => (
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
      ) : (
        <Text className="text-gray-500 italic">No workers assigned</Text>
      )}
    </View>
  );

  const ImagesSection = () => (
    <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
      <Text className="text-lg font-bold mb-4">Photos</Text>
      {editMode ? (
        <PhotosUploader
          maxPhotos={5}
          addedPhotos={complaint?.photos || []}
          onChange={(photos) =>
            setComplaint((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                photos: photos,
              };
            })
          }
        />
      ) : (
        <ScrollView horizontal className="gap-4">
          {complaint?.photos?.map((photo, index) => (
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
                Complaint Details
              </Text>
              <Text className="text-gray-600 text-sm">
                Created by {complaint.createdBy} on{" "}
                {new Date(complaint.created_at).toDateString()}
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
            label="Client"
            value={complaint.clientName || ""}
            icon="person"
            onChangeText={(value) => handleFieldChange("clientName", value)}
            readonly={!editMode}
            placeholder="Enter client name"
            required
          />
          {editMode ? (
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
          ) : (
            <InputField
              label="Priority"
              value={complaint.priority || ""}
              icon="priority-high"
              readonly
              placeholder="Priority"
              required
            />
          )}
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
              required
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
                      ? new Date(complaint.dueDate).toDateString()
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
          <InputField
            label="Complaint Description"
            value={complaint.description || ""}
            icon="description"
            onChangeText={(value) => handleFieldChange("description", value)}
            readonly={!editMode}
            placeholder="Enter complaint description"
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
          <InputField
            label="Quotation"
            value={complaint.quotation || ""}
            icon="attach-money"
            readonly={!editMode}
            placeholder="Quotation"
            onChangeText={(value) => handleFieldChange("quotation", value)}
          />
          <InputField
            label="PO Number"
            value={complaint.poNumber || ""}
            icon="receipt"
            readonly={!editMode}
            placeholder="PO number"
            onChangeText={(value) => handleFieldChange("poNumber", value)}
          />
          {editMode ? (
            <View>
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
                      setComplaint((prev: any) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          jcReferences: [
                            ...(prev.jcReferences || []),
                            { jcReference },
                          ],
                        };
                      });
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
              {complaint.jcReferences?.length > 0 && (
                <View className="flex-row flex-wrap mb-6">
                  {complaint.jcReferences?.map((jc, index) => (
                    <View
                      key={index}
                      className="bg-gray-100 rounded-full p-2 mr-2 mb-2 flex-row items-center"
                    >
                      <Text>{jc.jcReference}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          setComplaint((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              jcReferences: prev.jcReferences?.filter(
                                (_: any, i: number) => i !== index
                              ),
                            };
                          })
                        }
                        className="ml-2"
                      >
                        <MaterialIcons name="close" size={20} color="#A82F39" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View className="mb-6">
              <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide mb-4">
                JC References
              </Text>
              <View className="flex-row flex-wrap">
                {complaint.jcReferences?.map((jc, index) => (
                  <View
                    key={index}
                    className="bg-gray-100 rounded-full p-2 mr-2 mb-2"
                  >
                    <Text>
                      {jc.jcReference}{" "}
                      {jc.jcDate
                        ? ` (${new Date(jc.jcDate).toDateString()})`
                        : ""}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {editMode ? (
            <View>
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
                      setComplaint((prev: any) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          dcReferences: [
                            ...(prev.dcReferences || []),
                            { dcReference },
                          ],
                        };
                      });
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
              {complaint.dcReferences?.length > 0 && (
                <View className="flex-row flex-wrap mb-6">
                  {complaint.dcReferences?.map((dc, index) => (
                    <View
                      key={index}
                      className="bg-gray-100 rounded-full p-2 mr-2 mb-2 flex-row items-center"
                    >
                      <Text>{dc.dcReference}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          setComplaint((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              dcReferences: prev.dcReferences?.filter(
                                (_: any, i: number) => i !== index
                              ),
                            };
                          })
                        }
                        className="ml-2"
                      >
                        <MaterialIcons name="close" size={20} color="#A82F39" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View className="mb-6">
              <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide mb-4">
                DC References
              </Text>
              <View className="flex-row flex-wrap">
                {complaint.dcReferences?.map((dc, index) => (
                  <View
                    key={index}
                    className="bg-gray-100 rounded-full p-2 mr-2 mb-2"
                  >
                    <Text>
                      {dc.dcReference}{" "}
                      {dc.dcDate
                        ? ` (${new Date(dc.dcDate).toDateString()})`
                        : ""}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          <InputField
            label="Remarks"
            value={complaint.remarks || ""}
            icon="notes"
            readonly={!editMode}
            placeholder="Remarks"
            onChangeText={(value) => handleFieldChange("remarks", value)}
          />
          {editMode ? (
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
                      setComplaint((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          visitDates: [...(prev.visitDates || []), visitDate],
                        };
                      });
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
                        setComplaint((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            visitDates: prev.visitDates?.filter(
                              (d) => d !== date
                            ),
                          };
                        })
                      }
                      className="ml-2"
                    >
                      <MaterialIcons name="close" size={20} color="#A82F39" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View className="mb-6">
              <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide mb-4">
                Visit Dates
              </Text>
              <View className="flex-row flex-wrap">
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
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
        {role !== "user" && <AssignedPersonnelSection />}
        {((complaint.photos && complaint.photos.length > 0) || editMode) && (
          <ImagesSection />
        )}

        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => {
              setModalVisible(false);
              setUserIds(
                complaint?.users.map((user) => user.id.toString()) || []
              );
            }}
            contentContainerStyle={{
              backgroundColor: "white",
              padding: 20,
              marginHorizontal: 20,
              borderRadius: 12,
            }}
          >
            <Text className="text-lg font-bold mb-2">Assign Users</Text>
            {users.length > 0 ? (
              <>
                <Text className="text-gray-600 mb-2">
                  Select users to assign:
                </Text>
                <ScrollView className="max-h-80">
                  {users.map((user) => (
                    <TouchableOpacity
                      key={user.id}
                      className={`flex-row items-center p-3 mb-2 rounded-lg border ${
                        userIds.includes(user.id.toString())
                          ? "border-primary bg-primary/10"
                          : "border-gray-200"
                      }`}
                      onPress={() => {
                        // Toggle selection
                        if (userIds.includes(user.id.toString())) {
                          setUserIds(
                            userIds.filter((id) => id !== user.id.toString())
                          );
                        } else {
                          setUserIds([...userIds, user.id.toString()]);
                        }
                      }}
                    >
                      <Avatar name={user.name} size="small" />
                      <Text className="ml-3 flex-1">{user.name}</Text>
                      {userIds.includes(user.id.toString()) && (
                        <MaterialIcons
                          name="check-circle"
                          size={24}
                          color="#A82F39"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : (
              <Text className="text-gray-500 italic mb-4">
                No users available
              </Text>
            )}
            <View className="flex-row mt-6 gap-4">
              <Button
                onPress={() => {
                  setModalVisible(false);
                  setUserIds(
                    complaint?.users.map((user) => user.id.toString()) || []
                  );
                }}
                mode="outlined"
                style={{ flex: 1 }}
                textColor="#374151"
              >
                Cancel
              </Button>
              <Button
                onPress={handleAssignUsers}
                mode="contained"
                style={{ flex: 1, backgroundColor: "#A82F39" }}
              >
                Update
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
