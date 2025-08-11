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

const formatServiceDates = (serviceDates: ServiceDate[]): string => {
  if (!serviceDates || serviceDates.length === 0) return "No dates";

  const upcomingDates = serviceDates.filter((sd) => !sd.isCompleted);
  const completedDates = serviceDates.filter((sd) => sd.isCompleted);

  if (upcomingDates.length > 0) {
    return `${upcomingDates.length} upcoming`;
  } else if (completedDates.length > 0) {
    return `${completedDates.length} completed`;
  }

  return `${serviceDates.length} total`;
};

const hasValue = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  if (typeof value === "object" && value.value && value.value.trim() === "")
    return false;
  return true;
};

const MaintenanceTableHeader = ({ isCompact }: { isCompact: boolean }) => {
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
          isCompact ? "text-sm w-36" : "w-40"
        }`}
      >
        Service Dates
      </Text>
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-36" : "w-40"
        }`}
      >
        Payment Status
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

const MaintenanceTableRow = ({
  item,
  index,
  isCompact,
}: {
  item: Maintenance;
  index: number;
  isCompact: boolean;
}) => {
  const isEvenRow = index % 2 === 0;

  const getPaymentStatusColor = (serviceDates: ServiceDate[]) => {
    const pendingPayments = serviceDates.filter(
      (sd) => sd.paymentStatus === "Pending"
    ).length;
    const overduePayments = serviceDates.filter(
      (sd) => sd.paymentStatus === "Overdue"
    ).length;
    const paidPayments = serviceDates.filter(
      (sd) => sd.paymentStatus === "Paid"
    ).length;

    if (overduePayments > 0) {
      return {
        text: `${overduePayments} overdue`,
        color: "text-red-700 bg-red-50 border-red-100",
      };
    } else if (pendingPayments > 0) {
      return {
        text: `${pendingPayments} pending`,
        color: "text-orange-700 bg-orange-50 border-orange-100",
      };
    } else if (paidPayments > 0) {
      return {
        text: `${paidPayments} paid`,
        color: "text-green-700 bg-green-50 border-green-100",
      };
    }

    return {
      text: "No payments",
      color: "text-gray-700 bg-gray-50 border-gray-100",
    };
  };

  const paymentInfo = getPaymentStatusColor(item.serviceDates);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/screens/maintenance/${item._id}`)}
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
        <Text
          numberOfLines={1}
          className={`text-gray-500 ${isCompact ? "text-xs" : "text-xs"}`}
        >
          Created by {item.createdBy.name}
        </Text>
      </View>

      <View
        className={`${isCompact ? "w-36" : "w-40"} px-3 py-2 ${
          item.serviceDates.length > 0 ? "bg-green-50" : "bg-red-50"
        } rounded-lg mx-1 border ${
          item.serviceDates.length > 0 ? "border-green-100" : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            item.serviceDates.length > 0 ? "text-green-700" : "text-red-700"
          } font-medium ${isCompact ? "text-xs" : "text-sm"}`}
        >
          {formatServiceDates(item.serviceDates)}
        </Text>
        <Text
          numberOfLines={1}
          className={`text-gray-500 ${
            isCompact ? "text-xs mt-0" : "text-xs mt-1"
          }`}
        >
          {item.serviceDates.length} total
        </Text>
      </View>

      <View
        className={`${
          isCompact ? "w-36" : "w-40"
        } px-3 py-2 h-full rounded-lg mx-1 border ${paymentInfo.color}`}
      >
        <Text
          numberOfLines={1}
          className={`font-medium ${isCompact ? "text-xs" : "text-sm"}`}
        >
          {paymentInfo.text}
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
            Created: {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const UserMaintenances = () => {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isLandscape, setIsLandscape] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const { token } = useAuthStore();

  const fetchMaintenances = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get<Maintenance[]>(
        `${process.env.EXPO_PUBLIC_API_URL}/maintenances/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMaintenances(response.data);
    } catch (error) {
      console.error("Error fetching user maintenances:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMaintenances();
  }, []);

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

  const filteredMaintenances = maintenances.filter((maintenance) => {
    const matchesFilter =
      selectedStatus === "All" || maintenance.status === selectedStatus;
    const matchesSearch =
      maintenance.clientName.toLowerCase().includes(searchText.toLowerCase()) ||
      (maintenance.remarks?.value?.toLowerCase() || "").includes(
        searchText.toLowerCase()
      );
    return matchesFilter && matchesSearch;
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
                  My Maintenances
                </Text>
                <Text className="text-gray-600">
                  {filteredMaintenances.length} assigned maintenances
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
                placeholder="Search by client or remarks"
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
              <MaintenanceTableHeader isCompact={isCompactMode} />
              <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={fetchMaintenances}
                  />
                }
              >
                {filteredMaintenances.length > 0 ? (
                  filteredMaintenances.map((maintenance, index) => (
                    <MaintenanceTableRow
                      key={maintenance._id.toString()}
                      item={maintenance}
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
                        ? "No maintenances match your filters"
                        : "No maintenances assigned"}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1 text-center">
                      {searchText || selectedStatus !== "All"
                        ? "Try adjusting your search or filters"
                        : "Wait for your supervisor to assign maintenance tasks"}
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

export default UserMaintenances;
