import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import InputField from "@/components/inputField";
import axios from "axios";

type ApprovalItem = {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
};

type ApprovalData = {
  heads: ApprovalItem[];
  admin: ApprovalItem[];
  users: ApprovalItem[];
};

const typeOptions = ["All", "Heads", "Admin", "Users"];
const statusOptions = ["All", "Pending", "Approved", "Rejected"];

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

const ApprovalTableHeader = () => {
  return (
    <View className="flex-row bg-gray-100 py-4 border-b border-gray-200 rounded-t-xl shadow-sm">
      <Text className="w-48 font-bold px-3 mx-1 text-gray-800">Name</Text>
      <Text className="w-48 font-bold px-3 mx-1 text-gray-800">Email</Text>
      <Text className="w-40 font-bold px-3 mx-1 text-gray-800">Phone</Text>
      <Text className="w-40 font-bold px-3 mx-1 text-gray-800">Department</Text>
      <Text className="w-40 font-bold px-3 mx-1 text-gray-800">Type</Text>
      <Text className="w-48 font-bold px-3 mx-1 text-gray-800">Date</Text>
      <Text className="w-40 font-bold px-3 mx-1 text-gray-800">Status</Text>
      <Text className="w-64 font-bold px-3 mx-1 text-gray-800">Actions</Text>
    </View>
  );
};

const Approvals = () => {
  const [approvalData, setApprovalData] = useState<ApprovalData>({
    heads: [],
    admin: [],
    users: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const fetchApprovals = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get<ApprovalData>(
        `${process.env.EXPO_PUBLIC_API_URL}/pending/requests`
      );
      setApprovalData(response.data);
    } catch (error) {
      console.error("Error fetching approvals:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const updateApprovalStatus = async (
    id: number,
    type: "heads" | "admin" | "users",
    status: "approved" | "rejected" | "pending"
  ) => {
    setRefreshing(true);
    try {
      // Adjust endpoint according to your API structure
      await axios.put(`${process.env.EXPO_PUBLIC_API_URL}/api/${type}/${id}`, {
        status,
      });

      setApprovalData((prevData) => {
        const updatedData = { ...prevData };
        updatedData[type] = prevData[type].map((item) =>
          item.id === id ? { ...item, status } : item
        );
        return updatedData;
      });
    } catch (error) {
      Alert.alert("Error", "Failed to update status. Please try again later.");
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  // Combine and filter all approval items
  const getAllApprovalItems = () => {
    let allItems: (ApprovalItem & { type: "heads" | "admin" | "users" })[] = [];

    // Add type property to each item for later identification
    approvalData.heads.forEach((item) =>
      allItems.push({ ...item, type: "heads" })
    );
    approvalData.admin.forEach((item) =>
      allItems.push({ ...item, type: "admin" })
    );
    approvalData.users.forEach((item) =>
      allItems.push({ ...item, type: "users" })
    );

    return allItems;
  };

  const filteredItems = getAllApprovalItems().filter((item) => {
    const matchesStatusFilter =
      selectedStatus === "All" || item.status === selectedStatus.toLowerCase();

    const matchesTypeFilter =
      selectedType === "All" || item.type === selectedType.toLowerCase();

    const matchesSearch =
      (item.name?.toLowerCase() || "").includes(searchText.toLowerCase()) ||
      (item.phone?.toLowerCase() || "").includes(searchText.toLowerCase()) ||
      (item.department?.toLowerCase() || "").includes(
        searchText.toLowerCase()
      ) ||
      (item.email?.toLowerCase() || "").includes(searchText.toLowerCase());

    return matchesStatusFilter && matchesTypeFilter && matchesSearch;
  });

  const ApprovalTableRow = ({
    item,
    index,
  }: {
    item: ApprovalItem & { type: "heads" | "admin" | "users" };
    index: number;
  }) => {
    const isEvenRow = index % 2 === 0;

    return (
      <View
        className={`flex-row py-4 border-b border-gray-200 items-center ${
          isEvenRow ? "bg-white" : "bg-gray-50"
        }`}
      >
        <View className="w-48 px-3 mx-1">
          <Text className="text-gray-800 text-lg font-medium">
            {item.name || "No name"}
          </Text>
        </View>

        <View className="w-48 px-3 mx-1">
          <Text className="text-gray-800">{item.email || "No email"}</Text>
        </View>

        <View className="w-40 px-3 mx-1">
          <Text className="text-gray-800">{item.phone || "No phone"}</Text>
        </View>

        <View className="w-40 px-3 mx-1">
          <Text className="text-gray-800">
            {item.department || "No department"}
          </Text>
        </View>

        <View className="w-40 px-3 mx-1">
          <View
            className={`py-2 px-3 rounded-full ${
              item.type === "heads"
                ? "bg-blue-100"
                : item.type === "admin"
                ? "bg-purple-100"
                : "bg-green-100"
            }`}
          >
            <Text
              className={`text-xs text-center font-semibold ${
                item.type === "heads"
                  ? "text-blue-800"
                  : item.type === "admin"
                  ? "text-purple-800"
                  : "text-green-800"
              }`}
            >
              {item.type === "heads"
                ? "Department Head"
                : item.type === "admin"
                ? "Administrator"
                : "Worker"}
            </Text>
          </View>
        </View>

        <View className="w-48 px-3 mx-1">
          <View className="flex-row items-center">
            <MaterialIcons name="event" size={16} color="#6B7280" />
            <Text className="text-gray-800 ml-1">
              {formatDate(item.created_at)}
            </Text>
          </View>
          <Text className="text-xs text-gray-500 mt-1">
            Updated: {formatDate(item.updated_at)}
          </Text>
        </View>

        <View className="w-40 px-3 mx-1">
          <View
            className={`py-2 px-3 rounded-full ${
              item.status === "pending"
                ? "bg-yellow-100"
                : item.status === "approved"
                ? "bg-green-100"
                : "bg-red-100"
            }`}
          >
            <Text
              className={`text-xs text-center font-semibold ${
                item.status === "pending"
                  ? "text-yellow-800"
                  : item.status === "approved"
                  ? "text-green-800"
                  : "text-red-800"
              }`}
            >
              {item.status[0].toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View className="w-64 px-3 mx-1">
          <View className="flex-row gap-2">
            {refreshing ? (
              <View className="flex-1 bg-gray-200 rounded-xl p-3 items-center">
                <Text className="text-gray-600 font-medium text-xs">
                  Loading...
                </Text>
              </View>
            ) : item.status === "pending" ? (
              <>
                <TouchableOpacity
                  onPress={() =>
                    updateApprovalStatus(item.id, item.type, "approved")
                  }
                  className="flex-1 bg-green-600 rounded-xl p-3 items-center"
                >
                  <Text className="text-white font-medium text-xs">
                    Approve
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    updateApprovalStatus(item.id, item.type, "rejected")
                  }
                  className="flex-1 bg-red-600 rounded-xl p-3 items-center"
                >
                  <Text className="text-white font-medium text-xs">Reject</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={() =>
                  updateApprovalStatus(item.id, item.type, "pending")
                }
                className="flex-1 bg-yellow-500 rounded-xl p-3 items-center"
              >
                <Text className="text-black font-medium text-xs">Undo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchApprovals} />
        }
      >
        <View className="flex-1">
          <View className="container my-6">
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-2xl font-bold text-gray-800">
                  Approvals
                </Text>
                <Text className="text-gray-600">
                  {filteredItems.length} pending requests
                </Text>
              </View>
            </View>

            {/* Filter and Search Section */}
            <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
              {/* Search Input */}
              <InputField
                placeholder="Search by name, email, phone, or department"
                value={searchText}
                onChangeText={setSearchText}
                icon="search"
              />

              {/* Type Filter */}
              <Text className="font-medium text-gray-700 mt-4 mb-2">
                Request Type
              </Text>
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

              {/* Status Filter */}
              <Text className="font-medium text-gray-700 mt-2 mb-2">
                Status
              </Text>
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
                        selectedStatus === status ? "bg-primary" : "bg-gray-100"
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
            </View>

            {/* Table View */}
            <View className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="min-w-full">
                  <ApprovalTableHeader />
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => (
                      <ApprovalTableRow
                        key={`${item.type}-${item.id}`}
                        item={item}
                        index={index}
                      />
                    ))
                  ) : (
                    <View className="py-12 items-center justify-center bg-white">
                      <MaterialIcons
                        name="error-outline"
                        size={32}
                        color="#9CA3AF"
                      />
                      <Text className="text-gray-500 mt-2 text-center font-medium">
                        {searchText ||
                        selectedStatus !== "All" ||
                        selectedType !== "All"
                          ? "No requests match your filters"
                          : "No approval requests found"}
                      </Text>
                      <Text className="text-gray-400 text-sm mt-1 text-center">
                        {searchText ||
                        selectedStatus !== "All" ||
                        selectedType !== "All"
                          ? "Try adjusting your search or filters"
                          : "Wait for new approval requests to appear"}
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Approvals;
