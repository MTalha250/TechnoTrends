import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import InputField from "@/components/inputField";
import axios from "axios";
import useAuthStore from "@/store/authStore";

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

const hasValue = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  if (typeof value === "object" && value.value && value.value.trim() === "")
    return false;
  return true;
};

const InvoiceTableHeader = ({ isCompact }: { isCompact: boolean }) => {
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
          isCompact ? "text-sm w-28" : "w-40"
        }`}
      >
        Invoice
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

const InvoiceTableRow = ({
  item,
  index,
  isCompact,
}: {
  item: Invoice;
  index: number;
  isCompact: boolean;
}) => {
  const isEvenRow = index % 2 === 0;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/screens/invoice/${item._id}`)}
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
          {item.project.clientName}
        </Text>
        <View
          className={`flex-row items-center ${isCompact ? "mt-0" : "mt-1"}`}
        >
          <Text
            numberOfLines={1}
            className={`text-gray-500 ${isCompact ? "text-xs" : "text-xs"}`}
          >
            {item.invoiceReference ? item.invoiceReference : "No reference"}
          </Text>
        </View>
      </View>

      <View
        className={`${isCompact ? "w-24" : "w-32"} px-3 py-2 ${
          hasValue(item.project.po?.value) ? "bg-green-50" : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.project.po?.value)
            ? "border-green-100"
            : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.project.po?.value) ? "text-green-700" : "text-red-700"
          } font-medium ${isCompact ? "text-xs" : "text-sm"}`}
        >
          {item.project.po?.value || "None"}
        </Text>
        <Text
          numberOfLines={1}
          className={`text-gray-500 ${
            isCompact ? "text-xs mt-0" : "text-xs mt-1"
          }`}
        >
          {formatDate(item.project.po?.updatedAt)}
        </Text>
      </View>

      <View
        className={`${isCompact ? "w-24" : "w-32"} px-3 py-2 ${
          hasValue(
            item.project.dcReferences[item.project.dcReferences.length - 1]
              ?.value
          )
            ? "bg-green-50"
            : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(
            item.project.dcReferences[item.project.dcReferences.length - 1]
              ?.value
          )
            ? "border-green-100"
            : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(
              item.project.dcReferences[item.project.dcReferences.length - 1]
                ?.value
            )
              ? "text-green-700"
              : "text-red-700"
          } font-medium ${isCompact ? "text-xs" : "text-sm"}`}
        >
          {item.project.dcReferences[item.project.dcReferences.length - 1]
            ?.value || "None"}
        </Text>
        <Text
          numberOfLines={1}
          className={`text-gray-500 ${
            isCompact ? "text-xs mt-0" : "text-xs mt-1"
          }`}
        >
          {formatDate(
            item.project.dcReferences[item.project.dcReferences.length - 1]
              ?.updatedAt
          )}
        </Text>
      </View>

      <View
        className={`${isCompact ? "w-24" : "w-32"} px-3 py-2 ${
          hasValue(
            item.project.jcReferences[item.project.jcReferences.length - 1]
              ?.value
          )
            ? "bg-green-50"
            : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(
            item.project.jcReferences[item.project.jcReferences.length - 1]
              ?.value
          )
            ? "border-green-100"
            : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(
              item.project.jcReferences[item.project.jcReferences.length - 1]
                ?.value
            )
              ? "text-green-700"
              : "text-red-700"
          } font-medium ${isCompact ? "text-xs" : "text-sm"}`}
        >
          {item.project.jcReferences[item.project.jcReferences.length - 1]
            ?.value || "None"}
        </Text>
        <Text
          numberOfLines={1}
          className={`text-gray-500 ${
            isCompact ? "text-xs mt-0" : "text-xs mt-1"
          }`}
        >
          {formatDate(
            item.project.jcReferences[item.project.jcReferences.length - 1]
              ?.updatedAt
          )}
        </Text>
      </View>

      <View
        className={`${isCompact ? "w-28" : "w-40"} px-3 py-2 ${
          hasValue(item.invoiceReference) && hasValue(item.invoiceDate)
            ? "bg-green-50"
            : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.invoiceReference) && hasValue(item.invoiceDate)
            ? "border-green-100"
            : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.invoiceReference) ? "text-green-700" : "text-red-700"
          } font-medium ${isCompact ? "text-xs" : "text-sm"}`}
        >
          {item.invoiceReference || "None"}
        </Text>
        <View className="flex-row justify-between">
          <Text
            numberOfLines={1}
            className={`text-gray-500 ${
              isCompact ? "text-xs mt-0" : "text-xs mt-1"
            }`}
          >
            {formatDate(item.invoiceDate)}
          </Text>
        </View>
      </View>

      <View className={`${isCompact ? "w-28" : "w-40"} px-3`}>
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

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isLandscape, setIsLandscape] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const { token } = useAuthStore();
  const insets = useSafeAreaInsets();
  const fetchInvoices = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get<Invoice[]>(
        `${process.env.EXPO_PUBLIC_API_URL}/invoices`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setInvoices(response.data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
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

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesStatus =
      selectedStatus === "All" || invoice.status === selectedStatus;
    const matchesSearch =
      invoice.project.clientName
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      invoice.invoiceReference
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (invoice.project.po?.value?.toLowerCase() || "").includes(
        searchText.toLowerCase()
      );
    return matchesStatus && matchesSearch;
  });

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
                  Invoices
                </Text>
                <Text className="text-gray-600">
                  {filteredInvoices.length} active invoices
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
                <TouchableOpacity
                  onPress={() => router.push("/screens/createInvoice")}
                  className="flex-row items-center gap-2 bg-primary px-4 py-3 rounded-xl"
                >
                  <MaterialIcons name="add" size={20} color="white" />
                  <Text className="font-medium text-white">New Invoice</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Filter and Search Section - Hidden in landscape */}
            <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
              <InputField
                placeholder="Search by client, reference or PO number"
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
              <InvoiceTableHeader isCompact={isCompactMode} />
              <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={fetchInvoices}
                  />
                }
              >
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice, index) => (
                    <InvoiceTableRow
                      key={invoice._id.toString()}
                      item={invoice}
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
                        ? "No invoices match your filters"
                        : "No invoices found"}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1 text-center">
                      {searchText || selectedStatus !== "All"
                        ? "Try adjusting your search or filters"
                        : "Create a new invoice to get started"}
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

export default Invoices;
