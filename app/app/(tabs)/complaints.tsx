import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import InputField from "@/components/inputField";
import axios from "axios";

const statusOptions = [
  "All",
  "Pending",
  "In Progress",
  "Completed",
  "Cancelled",
];

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
  return true;
};

const ComplaintTableHeader = () => {
  return (
    <View className="flex-row bg-gray-100 py-4 border-b border-gray-200 rounded-t-xl shadow-sm">
      <Text className="w-40 font-bold px-3 mx-1 text-gray-800">Client</Text>
      <Text className="w-40 font-bold px-3 mx-1 text-gray-800">
        Visit Dates
      </Text>
      <Text className="w-32 font-bold px-3 mx-1 text-gray-800">Quotation</Text>
      <Text className="w-32 font-bold px-3 mx-1 text-gray-800">PO</Text>
      <Text className="w-32 font-bold px-3 mx-1 text-gray-800">DC</Text>
      <Text className="w-32 font-bold px-3 mx-1 text-gray-800">JC</Text>
      <Text className="w-56 font-bold px-3 mx-1 text-gray-800">Remarks</Text>
      <Text className="w-40 font-bold px-3 mx-1 text-gray-800">Status</Text>
    </View>
  );
};

const ComplaintTableRow = ({
  item,
  index,
}: {
  item: Complaint;
  index: number;
}) => {
  const isEvenRow = index % 2 === 0;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/screens/complaint/${item.id}`)}
      className={`flex-row py-4 border-b border-gray-200 items-center ${
        isEvenRow ? "bg-white" : "bg-gray-50"
      }`}
    >
      <View className="w-40 px-3">
        <Text className="text-gray-800 text-lg font-medium">
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
            className={`text-xs ${
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
        className={`w-40 h-full px-3 py-2 ${
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
          className={`${
            hasValue(item.visitDates) && item.visitDates.length > 0
              ? "text-green-700"
              : "text-red-700"
          } font-medium`}
        >
          {formatVisitDates(item.visitDates)}
        </Text>
      </View>

      <View
        className={`w-32 px-3 py-2 ${
          hasValue(item.quotation) && hasValue(item.quotationDate)
            ? "bg-green-50"
            : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.quotation) && hasValue(item.quotationDate)
            ? "border-green-100"
            : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.quotation) ? "text-green-700" : "text-red-700"
          } font-medium`}
        >
          {item.quotation || "None"}
        </Text>
        <Text className="text-xs text-gray-500 mt-1">
          {formatDate(item.quotationDate)}
        </Text>
      </View>

      <View
        className={`w-32 px-3 py-2 ${
          hasValue(item.poNumber) && hasValue(item.poDate)
            ? "bg-green-50"
            : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.poNumber) && hasValue(item.poDate)
            ? "border-green-100"
            : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.poNumber) ? "text-green-700" : "text-red-700"
          } font-medium`}
        >
          {item.poNumber || "None"}
        </Text>
        <Text className="text-xs text-gray-500 mt-1">
          {formatDate(item.poDate)}
        </Text>
      </View>

      <View
        className={`w-32 px-3 py-2 ${
          hasValue(item.dcReference) && hasValue(item.dcDate)
            ? "bg-green-50"
            : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.dcReference) && hasValue(item.dcDate)
            ? "border-green-100"
            : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.dcReference) ? "text-green-700" : "text-red-700"
          } font-medium`}
        >
          {item.dcReference || "None"}
        </Text>
        <Text className="text-xs text-gray-500 mt-1">
          {formatDate(item.dcDate)}
        </Text>
      </View>

      <View
        className={`w-32 px-3 py-2 ${
          hasValue(item.jcReference) && hasValue(item.jcDate)
            ? "bg-green-50"
            : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.jcReference) && hasValue(item.jcDate)
            ? "border-green-100"
            : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.jcReference) ? "text-green-700" : "text-red-700"
          } font-medium`}
        >
          {item.jcReference || "None"}
        </Text>
        <Text className="text-xs text-gray-500 mt-1">
          {formatDate(item.jcDate)}
        </Text>
      </View>

      <View
        className={`w-56 px-3 py-2 ${
          hasValue(item.remarks) ? "bg-green-50" : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.remarks) ? "border-green-100" : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.remarks) ? "text-green-700" : "text-red-700"
          } font-medium`}
        >
          {item.remarks || "None"}
        </Text>
        <Text className="text-xs text-gray-500 mt-1">
          {formatDate(item.remarksDate)}
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
            className={`text-xs text-center font-semibold ${
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
        <View className="flex-row items-center mt-2">
          <MaterialIcons name="event" size={12} color="#6B7280" />
          <Text className="text-xs text-gray-500 ml-1">
            Due: {formatDate(item.dueDate)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Complaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");

  const fetchComplaints = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get<Complaint[]>(
        `${process.env.EXPO_PUBLIC_API_URL}/complaints`
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchComplaints} />
        }
      >
        <View className="flex-1">
          <View className="container my-6">
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-2xl font-bold text-gray-800">
                  Complaints
                </Text>
                <Text className="text-gray-600">
                  {filteredComplaints.length} active complaints
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/screens/createComplaint")}
                className="flex-row items-center gap-2 bg-primary px-4 py-3 rounded-xl"
              >
                <MaterialIcons name="add" size={20} color="white" />
                <Text className="font-medium text-white">New Complaint</Text>
              </TouchableOpacity>
            </View>

            {/* Filter and Search Section */}
            <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
              {/* Search Input */}
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

            {/* Table View */}
            <View className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="min-w-full">
                  <ComplaintTableHeader />
                  {filteredComplaints.length > 0 ? (
                    filteredComplaints.map((complaint, index) => (
                      <ComplaintTableRow
                        key={complaint.id.toString()}
                        item={complaint}
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
                        {searchText || selectedStatus !== "All"
                          ? "No complaints match your filters"
                          : "No complaints found"}
                      </Text>
                      <Text className="text-gray-400 text-sm mt-1 text-center">
                        {searchText || selectedStatus !== "All"
                          ? "Try adjusting your search or filters"
                          : "Create a new complaint to get started"}
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

export default Complaints;
