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

const hasValue = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
};

const InvoiceTableHeader = () => {
  return (
    <View className="flex-row bg-gray-100 py-4 border-b border-gray-200 rounded-t-xl shadow-sm">
      <Text className="w-40 font-bold px-3 mx-1 text-gray-800">Client</Text>
      <Text className="w-32 font-bold px-3 mx-1 text-gray-800">PO</Text>
      <Text className="w-32 font-bold px-3 mx-1 text-gray-800">DC</Text>
      <Text className="w-32 font-bold px-3 mx-1 text-gray-800">JC</Text>
      <Text className="w-40 font-bold px-3 mx-1 text-gray-800">Invoice</Text>
      <Text className="w-40 font-bold px-3 mx-1 text-gray-800">Status</Text>
    </View>
  );
};

const InvoiceTableRow = ({ item, index }: { item: Invoice; index: number }) => {
  const isEvenRow = index % 2 === 0;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/screens/invoice/${item.id}`)}
      className={`flex-row py-4 border-b border-gray-200 items-center ${
        isEvenRow ? "bg-white" : "bg-gray-50"
      }`}
    >
      <View className="w-40 px-3">
        <Text className="text-gray-800 text-lg font-medium">
          {item.project.clientName}
        </Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-xs text-gray-500">
            {item.invoiceReference ? item.invoiceReference : "No reference"}
          </Text>
        </View>
      </View>

      <View
        className={`w-32 px-3 py-2 ${
          hasValue(item.project.poNumber) && hasValue(item.project.poDate)
            ? "bg-green-50"
            : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.project.poNumber) && hasValue(item.project.poDate)
            ? "border-green-100"
            : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.project.poNumber) ? "text-green-700" : "text-red-700"
          } font-medium`}
        >
          {item.project.poNumber || "None"}
        </Text>
        <Text className="text-xs text-gray-500 mt-1">
          {formatDate(item.project.poDate)}
        </Text>
      </View>

      <View
        className={`w-32 px-3 py-2 ${
          hasValue(
            item.project.dcReferences[item.project.dcReferences.length - 1]
              ?.dcReference
          ) &&
          hasValue(
            item.project.dcReferences[item.project.dcReferences.length - 1]
              ?.dcDate
          )
            ? "bg-green-50"
            : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(
            item.project.dcReferences[item.project.dcReferences.length - 1]
              ?.dcReference
          ) &&
          hasValue(
            item.project.dcReferences[item.project.dcReferences.length - 1]
              ?.dcDate
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
                ?.dcReference
            )
              ? "text-green-700"
              : "text-red-700"
          } font-medium`}
        >
          {item.project.dcReferences[item.project.dcReferences.length - 1]
            ?.dcReference || "None"}
        </Text>
        <Text className="text-xs text-gray-500 mt-1">
          {formatDate(
            item.project.dcReferences[item.project.dcReferences.length - 1]
              ?.dcDate
          )}
        </Text>
      </View>

      <View
        className={`w-32 px-3 py-2 ${
          hasValue(
            item.project.jcReferences[item.project.jcReferences.length - 1]
              ?.jcReference
          ) &&
          hasValue(
            item.project.jcReferences[item.project.jcReferences.length - 1]
              ?.jcDate
          )
            ? "bg-green-50"
            : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(
            item.project.jcReferences[item.project.jcReferences.length - 1]
              ?.jcReference
          ) &&
          hasValue(
            item.project.jcReferences[item.project.jcReferences.length - 1]
              ?.jcDate
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
                ?.jcReference
            )
              ? "text-green-700"
              : "text-red-700"
          } font-medium`}
        >
          {item.project.jcReferences[item.project.jcReferences.length - 1]
            ?.jcReference || "None"}
        </Text>
        <Text className="text-xs text-gray-500 mt-1">
          {formatDate(
            item.project.jcReferences[item.project.jcReferences.length - 1]
              ?.jcDate
          )}
        </Text>
      </View>

      <View
        className={`w-40 px-3 py-2 ${
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
          } font-medium`}
        >
          {item.invoiceReference || "None"}
        </Text>
        <View className="flex-row justify-between">
          <Text className="text-xs text-gray-500 mt-1">
            {formatDate(item.invoiceDate)}
          </Text>
        </View>
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

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");

  const fetchInvoices = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get<Invoice[]>(
        `${process.env.EXPO_PUBLIC_API_URL}/invoices`
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
      invoice.project.poNumber.toLowerCase().includes(searchText.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchInvoices} />
        }
      >
        <View className="flex-1">
          <View className="container my-6">
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-2xl font-bold text-gray-800">
                  Invoices
                </Text>
                <Text className="text-gray-600">
                  {filteredInvoices.length} active invoices
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/screens/createInvoice")}
                className="flex-row items-center gap-2 bg-primary px-4 py-3 rounded-xl"
              >
                <MaterialIcons name="add" size={20} color="white" />
                <Text className="font-medium text-white">New Invoice</Text>
              </TouchableOpacity>
            </View>

            {/* Filter and Search Section */}
            <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
              {/* Search Input */}
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

            {/* Table View */}
            <View className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="min-w-full">
                  <InvoiceTableHeader />
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice, index) => (
                      <InvoiceTableRow
                        key={invoice.id.toString()}
                        item={invoice}
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
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Invoices;
