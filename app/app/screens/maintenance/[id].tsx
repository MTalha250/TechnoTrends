import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Modal, Portal, Button } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";
import InputField from "@/components/inputField";
import DateTimePicker from "@react-native-community/datetimepicker";
import useAuthStore from "@/store/authStore";
import { Dropdown } from "react-native-element-dropdown";

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

const MaintenanceDetail = () => {
  const { id } = useLocalSearchParams();
  const [maintenance, setMaintenance] = useState<Maintenance | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [userIds, setUserIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedServiceDateIndex, setSelectedServiceDateIndex] = useState<
    number | null
  >(null);
  const [editingServiceDate, setEditingServiceDate] =
    useState<ServiceDate | null>(null);
  const { role, token } = useAuthStore();

  const paymentStatusOptions = [
    { label: "Pending", value: "Pending" },
    { label: "Paid", value: "Paid" },
    { label: "Overdue", value: "Overdue" },
    { label: "Cancelled", value: "Cancelled" },
  ];

  const maintenanceStatusOptions = [
    { label: "Pending", value: "Pending" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" },
    { label: "Cancelled", value: "Cancelled" },
  ];

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate && editingServiceDate) {
      setEditingServiceDate({
        ...editingServiceDate,
        actualDate: selectedDate,
      });
    }
  };

  const fetchMaintenance = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Maintenance>(
        `${process.env.EXPO_PUBLIC_API_URL}/maintenances/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMaintenance(response.data);
      const response2 = await axios.get<User[]>(
        `${process.env.EXPO_PUBLIC_API_URL}/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(response2.data);
      setUserIds(response.data.users.map((user) => user._id));
    } catch (error) {
      console.error("Error fetching maintenance:", error);
      Alert.alert("Error", "Failed to fetch maintenance details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, [id]);

  const handleSaveChanges = async () => {
    if (!maintenance) return;

    try {
      setSaving(true);
      await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/maintenances/${id}`,
        maintenance,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert("Success", "Maintenance updated successfully");
      setEditMode(false);
      fetchMaintenance();
    } catch (error) {
      console.error("Error updating maintenance:", error);
      Alert.alert("Error", "Failed to update maintenance");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignUsers = async () => {
    try {
      await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/maintenances/${id}/assign-users`,
        { userIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert("Success", "Users assigned successfully");
      setModalVisible(false);
      fetchMaintenance();
    } catch (error) {
      console.error("Error assigning users:", error);
      Alert.alert("Error", "Failed to assign users");
    }
  };

  const handleDeleteMaintenance = async () => {
    Alert.alert(
      "Delete Maintenance",
      "Are you sure you want to delete this maintenance? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(
                `${process.env.EXPO_PUBLIC_API_URL}/maintenances/${id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              Alert.alert("Success", "Maintenance deleted successfully");
              router.back();
            } catch (error) {
              console.error("Error deleting maintenance:", error);
              Alert.alert("Error", "Failed to delete maintenance");
            }
          },
        },
      ]
    );
  };

  const handleFieldChange = (field: string, value: string) => {
    if (!maintenance) return;

    if (field === "remarks") {
      setMaintenance({
        ...maintenance,
        remarks: {
          ...maintenance.remarks,
          value: value,
          isEdited: true,
        },
      });
    } else {
      setMaintenance({
        ...maintenance,
        [field]: value,
      });
    }
  };

  const handleServiceDateUpdate = (
    index: number,
    updatedServiceDate: ServiceDate
  ) => {
    if (!maintenance) return;

    const updatedServiceDates = [...maintenance.serviceDates];
    updatedServiceDates[index] = updatedServiceDate;

    setMaintenance({
      ...maintenance,
      serviceDates: updatedServiceDates,
    });
  };

  const openServiceDateEditor = (index: number) => {
    setSelectedServiceDateIndex(index);
    setEditingServiceDate({ ...maintenance!.serviceDates[index] });
  };

  const saveServiceDateChanges = async () => {
    if (
      selectedServiceDateIndex === null ||
      !editingServiceDate ||
      !maintenance
    ) {
      return;
    }

    try {
      // Prepare an updated array for backend
      const updatedServiceDates = [...maintenance.serviceDates];
      updatedServiceDates[selectedServiceDateIndex] = editingServiceDate;

      // Persist to backend
      await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/maintenances/${id}`,
        { serviceDates: updatedServiceDates },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state and close modal
      setMaintenance({ ...maintenance, serviceDates: updatedServiceDates });
      setSelectedServiceDateIndex(null);
      setEditingServiceDate(null);
      Alert.alert("Success", "Service date updated successfully");
    } catch (error) {
      console.error("Error updating service date:", error);
      Alert.alert("Error", "Failed to update service date");
    }
  };

  const Avatar = ({
    name,
    size = "medium",
  }: {
    name: string;
    size?: "small" | "medium" | "large";
  }) => {
    const sizes = {
      small: "w-8 h-8 text-xs",
      medium: "w-10 h-10 text-sm",
      large: "w-12 h-12 text-base",
    };

    return (
      <View
        className={`${sizes[size]} ${getAvatarColor(
          name
        )} rounded-full items-center justify-center`}
      >
        <Text className="text-white font-bold">{getInitials(name)}</Text>
      </View>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-green-700 bg-green-50 border-green-200";
      case "In Progress":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "Pending":
        return "text-orange-700 bg-orange-50 border-orange-200";
      case "Cancelled":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "Paid":
        return "text-green-700 bg-green-50 border-green-200";
      case "Pending":
        return "text-orange-700 bg-orange-50 border-orange-200";
      case "Overdue":
        return "text-red-700 bg-red-50 border-red-200";
      case "Cancelled":
        return "text-gray-700 bg-gray-50 border-gray-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (date: Date | string | null): string => {
    if (!date) return "Not set";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const AssignedPersonnelSection = () => (
    <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-semibold text-gray-800">
          Assigned Personnel
        </Text>
        {(role === "admin" || role === "director" || role === "head") && (
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="bg-primary rounded-xl px-4 py-2"
          >
            <Text className="text-white font-medium">Assign Users</Text>
          </TouchableOpacity>
        )}
      </View>

      {maintenance?.users && maintenance.users.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-4">
            {maintenance.users.map((user) => (
              <View key={user._id} className="items-center">
                <Avatar name={user.name} size="large" />
                <Text className="text-sm font-medium text-gray-800 mt-2 text-center">
                  {user.name}
                </Text>
                <Text className="text-xs text-gray-500 capitalize">
                  {user.role}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View className="items-center py-8">
          <MaterialIcons name="people-outline" size={48} color="#9CA3AF" />
          <Text className="text-gray-500 mt-2 text-center">
            No users assigned
          </Text>
          <Text className="text-gray-400 text-sm text-center">
            Assign users to this maintenance
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#A82F39" />
        <Text className="mt-4 text-gray-600">
          Loading maintenance details...
        </Text>
      </SafeAreaView>
    );
  }

  if (!maintenance) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <MaterialIcons name="error-outline" size={48} color="#9CA3AF" />
        <Text className="mt-4 text-gray-600 text-center">
          Maintenance not found
        </Text>
      </SafeAreaView>
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
                Maintenance Details
              </Text>
              <Text className="text-gray-600 text-sm">
                Created by {maintenance.createdBy.name} on{" "}
                {new Date(maintenance.createdAt).toDateString()}
              </Text>
            </View>
          </View>
          <View
            className={`px-3 py-1 rounded-full ${
              maintenance.status === "Completed"
                ? "bg-green-100"
                : maintenance.status === "In Progress"
                ? "bg-blue-100"
                : maintenance.status === "Pending"
                ? "bg-yellow-100"
                : "bg-red-100"
            }`}
          >
            <Text
              className={`font-medium ${
                maintenance.status === "Completed"
                  ? "text-green-800"
                  : maintenance.status === "In Progress"
                  ? "text-blue-800"
                  : maintenance.status === "Pending"
                  ? "text-yellow-800"
                  : "text-red-800"
              }`}
            >
              {maintenance.status}
            </Text>
          </View>
        </View>
        <View className="flex-row gap-2 justify-center mb-4">
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
            className={`p-3 rounded-xl ${
              editMode ? "bg-green-600 w-full" : "bg-primary w-[48%]"
            } ${saving ? "opacity-50" : ""}`}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold">
                {editMode ? "Save Changes" : "Edit Maintenance"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Delete Button */}
          {!editMode && (role === "admin" || role === "director") && (
            <TouchableOpacity
              onPress={handleDeleteMaintenance}
              disabled={saving}
              className={`w-[48%] p-3 rounded-xl bg-red-600 ${
                saving ? "opacity-50" : ""
              }`}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-semibold">
                  Delete Maintenance
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Basic Information */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <Text className="text-xl font-semibold text-gray-800 mb-4">
            Basic Information
          </Text>

          <InputField
            label="Client Name"
            value={maintenance.clientName || ""}
            onChangeText={(text) => handleFieldChange("clientName", text)}
            icon="person"
            readonly={!editMode}
          />

          <InputField
            label="Remarks"
            value={maintenance.remarks?.value || ""}
            onChangeText={(text) => handleFieldChange("remarks", text)}
            icon="note"
            readonly={!editMode}
          />

          {/* Status Editor */}
          <View className="mt-2">
            <Text className="text-gray-700 font-medium mb-2">Status</Text>
            {editMode ? (
              <Dropdown
                data={maintenanceStatusOptions}
                labelField="label"
                valueField="value"
                value={maintenance.status}
                onChange={(item) =>
                  setMaintenance({
                    ...maintenance,
                    status: item.value as Maintenance["status"],
                  })
                }
                style={{
                  borderColor: "#d1d5db",
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 12,
                }}
              />
            ) : (
              <View
                className={`px-4 py-2 rounded-xl border ${getStatusColor(
                  maintenance.status
                )}`}
              >
                <Text className="font-medium">{maintenance.status}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Service Dates */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <Text className="text-xl font-semibold text-gray-800 mb-4">
            Service Dates ({maintenance.serviceDates.length})
          </Text>

          {maintenance.serviceDates.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                {/* Header */}
                <View className="flex-row bg-gray-100 p-3 rounded-t-xl">
                  <Text className="font-bold text-gray-800 w-32">
                    Service Date
                  </Text>
                  <Text className="font-bold text-gray-800 w-32">
                    Actual Date
                  </Text>
                  <Text className="font-bold text-gray-800 w-28">JC Ref</Text>
                  <Text className="font-bold text-gray-800 w-28">Invoice</Text>
                  <Text className="font-bold text-gray-800 w-28">Payment</Text>
                  <Text className="font-bold text-gray-800 w-24">Status</Text>
                  <Text className="font-bold text-gray-800 w-20">Action</Text>
                </View>

                {/* Rows */}
                {maintenance.serviceDates.map((serviceDate, index) => (
                  <View
                    key={index}
                    className={`flex-row border-b border-gray-200 p-3 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <Text className="text-gray-800 w-32 text-sm">
                      {formatDate(serviceDate.serviceDate)}
                    </Text>
                    <Text className="text-gray-800 w-32 text-sm">
                      {formatDate(serviceDate.actualDate)}
                    </Text>
                    <Text className="text-gray-800 w-28 text-sm">
                      {serviceDate.jcReference || "N/A"}
                    </Text>
                    <Text className="text-gray-800 w-28 text-sm">
                      {serviceDate.invoiceRef || "N/A"}
                    </Text>
                    <View
                      className={`w-28 px-2 py-1 rounded-lg ${getPaymentStatusColor(
                        serviceDate.paymentStatus
                      )}`}
                    >
                      <Text className="text-xs font-medium">
                        {serviceDate.paymentStatus}
                      </Text>
                    </View>
                    <View
                      className={`w-24 px-2 py-1 rounded-lg ${
                        serviceDate.isCompleted
                          ? "bg-green-50 text-green-700"
                          : "bg-orange-50 text-orange-700"
                      }`}
                    >
                      <Text className="text-xs font-medium">
                        {serviceDate.isCompleted ? "Done" : "Pending"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => openServiceDateEditor(index)}
                      className="w-20 items-center"
                    >
                      <MaterialIcons name="edit" size={16} color="#3B82F6" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View className="items-center py-8">
              <MaterialIcons name="schedule" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-2 text-center">
                No service dates scheduled
              </Text>
            </View>
          )}
        </View>

        {/* Assigned Personnel */}
        <AssignedPersonnelSection />
      </ScrollView>

      {/* User Assignment Modal */}
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
          <Text className="text-lg font-bold mb-2">Assign Users</Text>
          {users.length > 0 ? (
            <>
              <Text className="text-gray-600 mb-2">
                Select users to assign:
              </Text>
              <ScrollView className="max-h-80">
                {users.map((user) => (
                  <TouchableOpacity
                    key={user._id}
                    className={`flex-row items-center p-3 mb-2 rounded-lg border ${
                      userIds.includes(user._id)
                        ? "border-primary bg-primary/10"
                        : "border-gray-200"
                    }`}
                    onPress={() => {
                      if (userIds.includes(user._id)) {
                        setUserIds(userIds.filter((id) => id !== user._id));
                      } else {
                        setUserIds([...userIds, user._id]);
                      }
                    }}
                  >
                    <Avatar name={user.name} size="small" />
                    <Text className="ml-3 flex-1">{user.name}</Text>
                    {userIds.includes(user._id) && (
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
              onPress={() => setModalVisible(false)}
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

      {/* Service Date Edit Modal */}
      <Portal>
        <Modal
          visible={selectedServiceDateIndex !== null}
          onDismiss={() => {
            setSelectedServiceDateIndex(null);
            setEditingServiceDate(null);
          }}
          contentContainerStyle={{
            backgroundColor: "white",
            margin: 20,
            borderRadius: 20,
            padding: 20,
          }}
        >
          {editingServiceDate && (
            <ScrollView>
              <Text className="text-xl font-semibold mb-4">
                Edit Service Date
              </Text>

              <TouchableOpacity
                onPress={showDatePickerModal}
                className="bg-gray-100 p-4 rounded-xl mb-4"
              >
                <Text className="text-gray-600 text-sm mb-1">Actual Date</Text>
                <Text className="text-gray-800 font-medium">
                  {formatDate(editingServiceDate.actualDate)}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <View className="mb-4">
                  <DateTimePicker
                    value={
                      editingServiceDate.actualDate
                        ? new Date(editingServiceDate.actualDate)
                        : new Date()
                    }
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                </View>
              )}

              <InputField
                label="JC Reference"
                value={editingServiceDate.jcReference}
                onChangeText={(text) =>
                  setEditingServiceDate({
                    ...editingServiceDate,
                    jcReference: text,
                  })
                }
                icon="receipt"
                placeholder="Enter JC reference"
              />

              <InputField
                label="Invoice Reference"
                value={editingServiceDate.invoiceRef}
                onChangeText={(text) =>
                  setEditingServiceDate({
                    ...editingServiceDate,
                    invoiceRef: text,
                  })
                }
                icon="receipt-long"
                placeholder="Enter invoice reference"
              />

              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">
                  Payment Status
                </Text>
                <Dropdown
                  data={paymentStatusOptions}
                  labelField="label"
                  valueField="value"
                  value={editingServiceDate.paymentStatus}
                  onChange={(item) =>
                    setEditingServiceDate({
                      ...editingServiceDate,
                      paymentStatus: item.value as any,
                    })
                  }
                  style={{
                    borderColor: "#d1d5db",
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 12,
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={() =>
                  setEditingServiceDate({
                    ...editingServiceDate,
                    isCompleted: !editingServiceDate.isCompleted,
                  })
                }
                className={`flex-row items-center p-4 rounded-xl mb-6 ${
                  editingServiceDate.isCompleted
                    ? "bg-green-50"
                    : "bg-orange-50"
                }`}
              >
                <MaterialIcons
                  name={
                    editingServiceDate.isCompleted
                      ? "check-circle"
                      : "radio-button-unchecked"
                  }
                  size={24}
                  color={editingServiceDate.isCompleted ? "#059669" : "#D97706"}
                />
                <Text
                  className={`ml-3 font-medium ${
                    editingServiceDate.isCompleted
                      ? "text-green-700"
                      : "text-orange-700"
                  }`}
                >
                  Mark as{" "}
                  {editingServiceDate.isCompleted ? "Pending" : "Completed"}
                </Text>
              </TouchableOpacity>

              <View className="flex-row gap-3">
                <Button
                  mode="outlined"
                  onPress={() => {
                    setSelectedServiceDateIndex(null);
                    setEditingServiceDate(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={saveServiceDateChanges}
                  className="flex-1"
                >
                  Save
                </Button>
              </View>
            </ScrollView>
          )}
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

export default MaintenanceDetail;
