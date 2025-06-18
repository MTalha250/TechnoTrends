import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  Alert,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import InputField from "@/components/inputField";
import axios from "axios";
import useAuthStore from "@/store/authStore";

const typeOptions = ["All", "Directors", "Admins", "Heads", "Users"];
const statusOptions = ["All", "Pending", "Approved", "Rejected"];
const tabOptions = ["Pending Requests", "Approved Users"];

// Helper function to format dates
const formatDate = (date: string | null): string => {
  if (!date) return "No date";

  const dateObj = new Date(date);
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const ApprovalTableHeader = ({ isCompact }: { isCompact: boolean }) => {
  return (
    <View
      className={`flex-row bg-gray-100 border-b border-gray-200 rounded-t-xl shadow-sm ${
        isCompact ? "py-2" : "py-4"
      }`}
    >
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-36" : "w-48"
        }`}
      >
        Name
      </Text>
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-36" : "w-52"
        }`}
      >
        Email
      </Text>
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-28" : "w-40"
        }`}
      >
        Phone
      </Text>
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-28" : "w-40"
        }`}
      >
        Department
      </Text>
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-28" : "w-40"
        }`}
      >
        Type
      </Text>
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-36" : "w-48"
        }`}
      >
        Date
      </Text>
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-28" : "w-40"
        }`}
      >
        Status
      </Text>
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-48" : "w-56"
        }`}
      >
        Actions
      </Text>
    </View>
  );
};

const Approvals = () => {
  const [approvalData, setApprovalData] = useState<User[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedTab, setSelectedTab] = useState("Pending Requests");
  const [isLandscape, setIsLandscape] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const { token } = useAuthStore();
  const insets = useSafeAreaInsets();
  const fetchApprovals = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/users/pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setApprovalData(response.data);
    } catch (error) {
      console.error("Error fetching approvals:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchApprovedUsers = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/users/approved`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setApprovedUsers(response.data);
    } catch (error) {
      console.error("Error fetching approved users:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedTab === "Pending Requests") {
      fetchApprovals();
    } else {
      fetchApprovedUsers();
    }
  }, [selectedTab]);

  useEffect(() => {
    const updateOrientation = () => {
      const { width, height } = Dimensions.get("window");
      setIsLandscape(width > height);
    };

    // Get initial orientation
    updateOrientation();

    // Listen for orientation changes
    const subscription = Dimensions.addEventListener(
      "change",
      updateOrientation
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  const updateApprovalStatus = async (
    id: string,
    status: "Approved" | "Rejected"
  ) => {
    setRefreshing(true);
    try {
      await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/users/pending/${id}`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchApprovals();
    } catch (error) {
      Alert.alert("Error", "Failed to update status. Please try again later.");
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const deleteUser = async (id: string, userName: string) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${userName}? This action cannot be undone.`,
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
              setRefreshing(true);
              await axios.delete(
                `${process.env.EXPO_PUBLIC_API_URL}/users/${id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              Alert.alert("Success", "User deleted successfully");
              fetchApprovedUsers();
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to delete user. Please try again later."
              );
              console.error(error);
            } finally {
              setRefreshing(false);
            }
          },
        },
      ]
    );
  };

  const filteredItems = (
    selectedTab === "Pending Requests" ? approvalData : approvedUsers
  ).filter((item) => {
    const matchesStatusFilter =
      selectedStatus === "All" || item.status === selectedStatus.toLowerCase();

    const matchesTypeFilter =
      selectedType === "All" ||
      item.role === selectedType.slice(0, -1).toLowerCase();

    const matchesSearch =
      (item.name?.toLowerCase() || "").includes(searchText.toLowerCase()) ||
      (item.phone?.toLowerCase() || "").includes(searchText.toLowerCase()) ||
      (item.department?.toLowerCase() || "").includes(
        searchText.toLowerCase()
      ) ||
      (item.email?.toLowerCase() || "").includes(searchText.toLowerCase());

    return matchesStatusFilter && matchesTypeFilter && matchesSearch;
  });

  const ApprovedUserTableRow = ({
    item,
    index,
    isCompact,
  }: {
    item: User;
    index: number;
    isCompact: boolean;
  }) => {
    const isEvenRow = index % 2 === 0;

    return (
      <View
        className={`flex-row border-b border-gray-200 items-center ${
          isCompact ? "py-2" : "py-4"
        } ${isEvenRow ? "bg-white" : "bg-gray-50"}`}
      >
        <View className={`${isCompact ? "w-28" : "w-48"} px-3 mx-1`}>
          <Text
            className={`text-gray-800 font-medium ${
              isCompact ? "text-sm" : "text-lg"
            }`}
          >
            {item.name || "No name"}
          </Text>
        </View>

        <View className={`${isCompact ? "w-36" : "w-52"} px-3 mx-1`}>
          <Text
            className={`text-gray-800 ${isCompact ? "text-xs" : "text-sm"}`}
          >
            {item.email || "No email"}
          </Text>
        </View>

        <View className={`${isCompact ? "w-28" : "w-40"} px-3 mx-1`}>
          <Text
            className={`text-gray-800 ${isCompact ? "text-sm" : "text-base"}`}
          >
            {item.phone || "No phone"}
          </Text>
        </View>

        <View className={`${isCompact ? "w-28" : "w-40"} px-3 mx-1`}>
          <Text
            className={`text-gray-800 ${isCompact ? "text-sm" : "text-base"}`}
          >
            {item.department || "No department"}
          </Text>
        </View>

        <View className={`${isCompact ? "w-28" : "w-40"} px-3 mx-1`}>
          <View
            className={`py-2 px-3 rounded-full ${
              item.role === "director"
                ? "bg-red-100"
                : item.role === "admin"
                ? "bg-purple-100"
                : item.role === "head"
                ? "bg-blue-100"
                : "bg-green-100"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                isCompact ? "text-xs" : "text-xs"
              } ${
                item.role === "director"
                  ? "text-red-800"
                  : item.role === "admin"
                  ? "text-purple-800"
                  : item.role === "head"
                  ? "text-blue-800"
                  : "text-green-800"
              }`}
            >
              {item.role === "director"
                ? "Director"
                : item.role === "head"
                ? "Department Head"
                : item.role === "admin"
                ? "Administrator"
                : "Worker"}
            </Text>
          </View>
        </View>

        <View className={`${isCompact ? "w-36" : "w-48"} px-3 mx-1`}>
          <View className="flex-row items-center">
            <MaterialIcons
              name="event"
              size={isCompact ? 14 : 16}
              color="#6B7280"
            />
            <Text
              className={`text-gray-800 ml-1 ${
                isCompact ? "text-sm" : "text-base"
              }`}
            >
              {formatDate(item.createdAt)}
            </Text>
          </View>
          <Text
            className={`text-gray-500 ${
              isCompact ? "text-xs mt-0" : "text-xs mt-1"
            }`}
          >
            Updated: {formatDate(item.updatedAt)}
          </Text>
        </View>

        <View className={`${isCompact ? "w-28" : "w-40"} px-3 mx-1`}>
          <View className="py-2 px-3 rounded-full bg-green-100">
            <Text
              className={`text-center font-semibold text-green-800 ${
                isCompact ? "text-xs" : "text-xs"
              }`}
            >
              Approved
            </Text>
          </View>
        </View>

        <View className={`${isCompact ? "w-48" : "w-56"} px-3 mx-1`}>
          <TouchableOpacity
            onPress={() => deleteUser(item._id, item.name)}
            disabled={refreshing}
            className={`bg-red-600 rounded-xl items-center ${
              isCompact ? "p-2" : "p-3"
            } ${refreshing ? "opacity-50" : ""}`}
          >
            <Text
              className={`text-white font-medium ${
                isCompact ? "text-xs" : "text-xs"
              }`}
            >
              {refreshing ? "Loading..." : "Delete User"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ApprovalTableRow = ({
    item,
    index,
    isCompact,
  }: {
    item: User;
    index: number;
    isCompact: boolean;
  }) => {
    const isEvenRow = index % 2 === 0;

    return (
      <View
        className={`flex-row border-b border-gray-200 items-center ${
          isCompact ? "py-2" : "py-4"
        } ${isEvenRow ? "bg-white" : "bg-gray-50"}`}
      >
        <View className={`${isCompact ? "w-36" : "w-48"} px-3 mx-1`}>
          <Text
            className={`text-gray-800 font-medium ${
              isCompact ? "text-sm" : "text-lg"
            }`}
          >
            {item.name || "No name"}
          </Text>
        </View>

        <View className={`${isCompact ? "w-36" : "w-52"} px-3 mx-1`}>
          <Text
            className={`text-gray-800 ${isCompact ? "text-sm" : "text-base"}`}
          >
            {item.email || "No email"}
          </Text>
        </View>

        <View className={`${isCompact ? "w-28" : "w-40"} px-3 mx-1`}>
          <Text
            className={`text-gray-800 ${isCompact ? "text-sm" : "text-base"}`}
          >
            {item.phone || "No phone"}
          </Text>
        </View>

        <View className={`${isCompact ? "w-28" : "w-40"} px-3 mx-1`}>
          <Text
            className={`text-gray-800 ${isCompact ? "text-sm" : "text-base"}`}
          >
            {item.department || "No department"}
          </Text>
        </View>

        <View className={`${isCompact ? "w-28" : "w-40"} px-3 mx-1`}>
          <View
            className={`py-2 px-3 rounded-full ${
              item.role === "director"
                ? "bg-red-100"
                : item.role === "admin"
                ? "bg-purple-100"
                : item.role === "head"
                ? "bg-blue-100"
                : "bg-green-100"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                isCompact ? "text-xs" : "text-xs"
              } ${
                item.role === "director"
                  ? "text-red-800"
                  : item.role === "admin"
                  ? "text-purple-800"
                  : item.role === "head"
                  ? "text-blue-800"
                  : "text-green-800"
              }`}
            >
              {item.role === "director"
                ? "Director"
                : item.role === "head"
                ? "Department Head"
                : item.role === "admin"
                ? "Administrator"
                : "Worker"}
            </Text>
          </View>
        </View>

        <View className={`${isCompact ? "w-36" : "w-48"} px-3 mx-1`}>
          <View className="flex-row items-center">
            <MaterialIcons
              name="event"
              size={isCompact ? 14 : 16}
              color="#6B7280"
            />
            <Text
              className={`text-gray-800 ml-1 ${
                isCompact ? "text-sm" : "text-base"
              }`}
            >
              {formatDate(item.createdAt)}
            </Text>
          </View>
          <Text
            className={`text-gray-500 ${
              isCompact ? "text-xs mt-0" : "text-xs mt-1"
            }`}
          >
            Updated: {formatDate(item.updatedAt)}
          </Text>
        </View>

        <View className={`${isCompact ? "w-28" : "w-40"} px-3 mx-1`}>
          <View
            className={`py-2 px-3 rounded-full ${
              item.status === "Pending"
                ? "bg-yellow-100"
                : item.status === "Approved"
                ? "bg-green-100"
                : "bg-red-100"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                isCompact ? "text-xs" : "text-xs"
              } ${
                item.status === "Pending"
                  ? "text-yellow-800"
                  : item.status === "Approved"
                  ? "text-green-800"
                  : "text-red-800"
              }`}
            >
              {item.status[0].toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View className={`${isCompact ? "w-48" : "w-64"} px-3 mx-1`}>
          <View className="flex-row gap-2">
            {refreshing ? (
              <View
                className={`flex-1 bg-gray-200 rounded-xl items-center ${
                  isCompact ? "p-2" : "p-3"
                }`}
              >
                <Text
                  className={`text-gray-600 font-medium ${
                    isCompact ? "text-xs" : "text-xs"
                  }`}
                >
                  Loading...
                </Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => updateApprovalStatus(item._id, "Approved")}
                  className={`flex-1 bg-green-600 rounded-xl items-center ${
                    isCompact ? "p-2" : "p-3"
                  }`}
                >
                  <Text
                    className={`text-white font-medium ${
                      isCompact ? "text-xs" : "text-xs"
                    }`}
                  >
                    Approve
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => updateApprovalStatus(item._id, "Rejected")}
                  className={`flex-1 bg-red-600 rounded-xl items-center ${
                    isCompact ? "p-2" : "p-3"
                  }`}
                >
                  <Text
                    className={`text-white font-medium ${
                      isCompact ? "text-xs" : "text-xs"
                    }`}
                  >
                    Reject
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View
      className="flex-1 bg-gray-50"
      style={{
        paddingTop: isLandscape ? 0 : insets.top,
        paddingBottom: isLandscape ? 0 : insets.bottom,
      }}
    >
      <View className="flex-1 container my-6">
        {/* Header - Hidden in landscape */}
        {!isLandscape && (
          <View>
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-2xl font-bold text-gray-800">
                  {selectedTab === "Pending Requests"
                    ? "Approvals"
                    : "User Management"}
                </Text>
                <Text className="text-gray-600">
                  {filteredItems.length}{" "}
                  {selectedTab === "Pending Requests"
                    ? "pending requests"
                    : "approved users"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsCompactMode(!isCompactMode)}
                className={`flex-row items-center gap-2 px-4 py-3 rounded-xl ${
                  isCompactMode ? "bg-blue-600" : "bg-gray-600"
                }`}
              >
                <MaterialIcons
                  name={isCompactMode ? "view-agenda" : "view-compact"}
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              <View className="flex-row gap-2 w-full p-1">
                {tabOptions.map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setSelectedTab(tab)}
                    accessibilityRole="button"
                    className={`px-8 py-3 rounded-xl ${
                      selectedTab === tab ? "bg-primary" : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        selectedTab === tab ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {tab}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            {/* Filter and Search Section - Hidden in landscape */}
            <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
              <InputField
                placeholder="Search by name, email, phone, or department"
                value={searchText}
                onChangeText={setSearchText}
                icon="search"
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
              >
                <View className="flex-row gap-2 p-1">
                  {typeOptions.map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setSelectedType(type)}
                      accessibilityRole="button"
                      className={`px-6 py-3 rounded-xl ${
                        selectedType === type ? "bg-primary" : "bg-gray-100"
                      }`}
                    >
                      <Text
                        className={`font-medium ${
                          selectedType === type ? "text-white" : "text-gray-600"
                        }`}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              {selectedTab === "Pending Requests" && (
                <>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-2"
                  >
                    <View className="flex-row gap-2 p-1">
                      {statusOptions.map((status) => (
                        <TouchableOpacity
                          key={status}
                          onPress={() => setSelectedStatus(status)}
                          accessibilityRole="button"
                          className={`px-6 py-3 rounded-xl ${
                            selectedStatus === status
                              ? "bg-primary"
                              : "bg-gray-100"
                          }`}
                        >
                          <Text
                            className={`font-medium ${
                              selectedStatus === status
                                ? "text-white"
                                : "text-gray-600"
                            }`}
                          >
                            {status}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </>
              )}
            </View>
          </View>
        )}

        {/* Table View - Always visible */}
        <View
          className={`flex-1 bg-white rounded-xl shadow-sm overflow-hidden ${
            isLandscape ? "" : "mb-10"
          }`}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <ApprovalTableHeader isCompact={isCompactMode} />
              <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={
                      selectedTab === "Pending Requests"
                        ? fetchApprovals
                        : fetchApprovedUsers
                    }
                  />
                }
              >
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, index) =>
                    selectedTab === "Pending Requests" ? (
                      <ApprovalTableRow
                        key={item._id}
                        item={item}
                        index={index}
                        isCompact={isCompactMode}
                      />
                    ) : (
                      <ApprovedUserTableRow
                        key={item._id}
                        item={item}
                        index={index}
                        isCompact={isCompactMode}
                      />
                    )
                  )
                ) : (
                  <View className="py-12 items-center justify-center bg-white">
                    <MaterialIcons
                      name="error-outline"
                      size={32}
                      color="#9CA3AF"
                    />
                    <Text className="text-gray-500 mt-2 text-center font-medium">
                      {searchText ||
                      selectedType !== "All" ||
                      (selectedTab === "Pending Requests" &&
                        selectedStatus !== "All")
                        ? `No ${
                            selectedTab === "Pending Requests"
                              ? "requests"
                              : "users"
                          } match your filters`
                        : selectedTab === "Pending Requests"
                        ? "No approval requests found"
                        : "No approved users found"}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1 text-center">
                      {searchText ||
                      selectedType !== "All" ||
                      (selectedTab === "Pending Requests" &&
                        selectedStatus !== "All")
                        ? "Try adjusting your search or filters"
                        : selectedTab === "Pending Requests"
                        ? "Wait for new approval requests to appear"
                        : "No users have been approved yet"}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default Approvals;
