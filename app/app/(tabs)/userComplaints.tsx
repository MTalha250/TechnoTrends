import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import InputField from "@/components/inputField";
import axios from "axios";
import useAuthStore from "@/store/authStore";

const statusOptions = ["All", "Pending", "In Progress", "Completed"];

// Helper function to format dates
const formatDate = (date: Date | null | string): string => {
  if (!date) return "No date";

  if (typeof date === "string") {
    date = new Date(date);
  }

  return date instanceof Date
    ? date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "None";
};

// Helper function to format multiple visit dates
const formatVisitDates = (dates: Date[]): string => {
  if (!dates || dates.length === 0) return "No visits";

  if (dates.length === 1) return formatDate(dates[0]);
  return `${dates.map((date) => formatDate(date)).join(" - ")}`;
};

const hasValue = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  if (typeof value === "object" && value.value && value.value.trim() === "")
    return false;
  return true;
};

const ComplaintTableHeader = ({ isCompact }: { isCompact: boolean }) => {
  return (
    <View
      className={`flex-row bg-gray-100 border-b border-gray-200 rounded-t-xl shadow-sm ${
        isCompact ? "py-2" : "py-4"
      }`}
    >
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-28" : "w-40"
        }`}
      >
        Client
      </Text>
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-28" : "w-40"
        }`}
      >
        Visit Dates
      </Text>
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-24" : "w-32"
        }`}
      >
        Quotation
      </Text>
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-24" : "w-32"
        }`}
      >
        PO
      </Text>
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-24" : "w-32"
        }`}
      >
        DC
      </Text>
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-24" : "w-32"
        }`}
      >
        JC
      </Text>
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-40" : "w-56"
        }`}
      >
        Remarks
      </Text>
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-28" : "w-40"
        }`}
      >
        Status
      </Text>
    </View>
  );
};

const ComplaintTableRow = ({
  item,
  index,
  isCompact,
}: {
  item: Complaint;
  index: number;
  isCompact: boolean;
}) => {
  const isEvenRow = index % 2 === 0;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/screens/complaint/${item._id}`)}
      className={`flex-row border-b border-gray-200 items-center ${
        isCompact ? "py-2" : "py-4"
      } ${isEvenRow ? "bg-white" : "bg-gray-50"}`}
    >
      <View className={`${isCompact ? "w-28" : "w-40"} px-3`}>
        <Text
          numberOfLines={1}
          className={`text-gray-800 font-medium ${
            isCompact ? "text-sm" : "text-lg"
          }`}
        >
          {item.clientName}
        </Text>
        <View
          className={`px-2 w-16 items-center py-1 rounded-full ${
            item.priority === "High"
              ? "bg-red-100"
              : item.priority === "Medium"
              ? "bg-orange-100"
              : "bg-blue-100"
          }`}
        >
          <Text
            numberOfLines={1}
            className={`${isCompact ? "text-xs" : "text-xs"} ${
              item.priority === "High"
                ? "text-red-800"
                : item.priority === "Medium"
                ? "text-orange-800"
                : "text-blue-800"
            }`}
          >
            {item.priority}
          </Text>
        </View>
      </View>

      <View
        className={`${isCompact ? "w-28" : "w-40"} h-full px-3 py-2 ${
          hasValue(item.visitDates) && item.visitDates.length > 0
            ? "bg-green-50"
            : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.visitDates) && item.visitDates.length > 0
            ? "border-green-100"
            : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={2}
          className={`${
            hasValue(item.visitDates) && item.visitDates.length > 0
              ? "text-green-700"
              : "text-red-700"
          } font-medium ${isCompact ? "text-xs" : "text-sm"}`}
        >
          {formatVisitDates(item.visitDates)}
        </Text>
      </View>

      <View
        className={`${isCompact ? "w-24" : "w-32"} px-3 py-2 ${
          hasValue(item.quotation?.value) ? "bg-green-50" : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.quotation?.value)
            ? "border-green-100"
            : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.quotation?.value) ? "text-green-700" : "text-red-700"
          } font-medium ${isCompact ? "text-xs" : "text-sm"}`}
        >
          {item.quotation?.value || "None"}
        </Text>
        <Text
          numberOfLines={1}
          className={`text-gray-500 ${
            isCompact ? "text-xs mt-0" : "text-xs mt-1"
          }`}
        >
          {formatDate(item.quotation?.updatedAt)}
        </Text>
      </View>

      <View
        className={`${isCompact ? "w-24" : "w-32"} px-3 py-2 ${
          hasValue(item.po?.value) ? "bg-green-50" : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.po?.value) ? "border-green-100" : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.po?.value) ? "text-green-700" : "text-red-700"
          } font-medium ${isCompact ? "text-xs" : "text-sm"}`}
        >
          {item.po?.value || "None"}
        </Text>
        <Text
          numberOfLines={1}
          className={`text-gray-500 ${
            isCompact ? "text-xs mt-0" : "text-xs mt-1"
          }`}
        >
          {formatDate(item.po?.updatedAt)}
        </Text>
      </View>

      <View
        className={`${isCompact ? "w-24" : "w-32"} px-3 py-2 ${
          hasValue(item.dcReferences[item.dcReferences.length - 1]?.value)
            ? "bg-green-50"
            : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.dcReferences[item.dcReferences.length - 1]?.value)
            ? "border-green-100"
            : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.dcReferences[item.dcReferences.length - 1]?.value)
              ? "text-green-700"
              : "text-red-700"
          } font-medium ${isCompact ? "text-xs" : "text-sm"}`}
        >
          {item.dcReferences[item.dcReferences.length - 1]?.value || "None"}
        </Text>
        <Text
          numberOfLines={1}
          className={`text-gray-500 ${
            isCompact ? "text-xs mt-0" : "text-xs mt-1"
          }`}
        >
          {formatDate(
            item.dcReferences[item.dcReferences.length - 1]?.updatedAt
          )}
        </Text>
      </View>

      <View
        className={`${isCompact ? "w-24" : "w-32"} px-3 py-2 ${
          hasValue(item.jcReferences[item.jcReferences.length - 1]?.value)
            ? "bg-green-50"
            : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.jcReferences[item.jcReferences.length - 1]?.value)
            ? "border-green-100"
            : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.jcReferences[item.jcReferences.length - 1]?.value)
              ? "text-green-700"
              : "text-red-700"
          } font-medium ${isCompact ? "text-xs" : "text-sm"}`}
        >
          {item.jcReferences[item.jcReferences.length - 1]?.value || "None"}
        </Text>
        <Text
          numberOfLines={1}
          className={`text-gray-500 ${
            isCompact ? "text-xs mt-0" : "text-xs mt-1"
          }`}
        >
          {formatDate(
            item.jcReferences[item.jcReferences.length - 1]?.updatedAt
          ) || "None"}
        </Text>
      </View>

      <View
        className={`${isCompact ? "w-40" : "w-56"} px-3 py-2 ${
          hasValue(item.remarks?.value) ? "bg-green-50" : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.remarks?.value) ? "border-green-100" : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.remarks?.value) ? "text-green-700" : "text-red-700"
          } font-medium ${isCompact ? "text-xs" : "text-sm"}`}
        >
          {item.remarks?.value || "None"}
        </Text>
        <Text
          numberOfLines={1}
          className={`text-gray-500 ${
            isCompact ? "text-xs mt-0" : "text-xs mt-1"
          }`}
        >
          {formatDate(item.remarks?.updatedAt)}
        </Text>
      </View>

      <View className="w-40 px-3">
        <View
          className={`py-2 px-3 rounded-full ${
            item.status === "Completed"
              ? "bg-green-100"
              : item.status === "In Progress"
              ? "bg-blue-100"
              : item.status === "Pending"
              ? "bg-yellow-100"
              : "bg-red-100"
          }`}
        >
          <Text
            numberOfLines={1}
            className={`text-center font-semibold ${
              isCompact ? "text-xs" : "text-xs"
            } ${
              item.status === "Completed"
                ? "text-green-800"
                : item.status === "In Progress"
                ? "text-blue-800"
                : item.status === "Pending"
                ? "text-yellow-800"
                : "text-red-800"
            }`}
          >
            {item.status}
          </Text>
        </View>
        <View
          className={`flex-row items-center ${isCompact ? "mt-1" : "mt-2"}`}
        >
          <MaterialIcons
            name="event"
            size={isCompact ? 10 : 12}
            color="#6B7280"
          />
          <Text
            numberOfLines={1}
            className={`text-gray-500 ml-1 ${
              isCompact ? "text-xs" : "text-xs"
            }`}
          >
            Due: {formatDate(item.dueDate)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const UserComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isLandscape, setIsLandscape] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const { user, token } = useAuthStore();

  const fetchComplaints = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get<Complaint[]>(
        `${process.env.EXPO_PUBLIC_API_URL}/complaints/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComplaints(response.data);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user?._id]);

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

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesStatus =
      selectedStatus === "All" || complaint.status === selectedStatus;
    const matchesSearch =
      complaint.clientName.toLowerCase().includes(searchText.toLowerCase()) ||
      complaint.complaintReference
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (complaint.description?.toLowerCase() || "").includes(
        searchText.toLowerCase()
      );
    return matchesStatus && matchesSearch;
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 container my-6">
        {/* Header - Hidden in landscape */}
        {!isLandscape && (
          <View>
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-2xl font-bold text-gray-800">
                  My Complaints
                </Text>
                <Text className="text-gray-600">
                  {filteredComplaints.length} assigned complaints
                </Text>
              </View>
              <View className="flex-row gap-2">
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
            </View>

            {/* Filter and Search Section - Hidden in landscape */}
            <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
              <InputField
                placeholder="Search by client, reference or description"
                value={searchText}
                onChangeText={setSearchText}
                icon="search"
              />
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
              <ComplaintTableHeader isCompact={isCompactMode} />
              <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={fetchComplaints}
                  />
                }
              >
                {filteredComplaints.length > 0 ? (
                  filteredComplaints.map((complaint, index) => (
                    <ComplaintTableRow
                      key={complaint._id.toString()}
                      item={complaint}
                      index={index}
                      isCompact={isCompactMode}
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
                      {searchText || selectedStatus !== "All"
                        ? "No complaints match your filters"
                        : "No complaints assigned to you"}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1 text-center">
                      {searchText || selectedStatus !== "All"
                        ? "Try adjusting your search or filters"
                        : "Check back later for new assignments"}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default UserComplaints;
