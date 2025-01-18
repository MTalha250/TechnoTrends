import React, { useEffect, useState } from "react";
import {
  FlatList,
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import axios from "axios";
import InputField from "@/components/inputField";
import InvoiceCard from "@/components/invoices/card";

// Type definitions
type InvoiceStatus = "Pending" | "Paid" | "Unpaid" | "Overdue" | "All";

const statusOptions: InvoiceStatus[] = [
  "All",
  "Pending",
  "Paid",
  "Unpaid",
  "Overdue",
];

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus>("All");

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
    const matchesFilter =
      selectedStatus === "All" || invoice.status === selectedStatus;

    const matchesSearch =
      invoice.invoiceReference
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (invoice.linkedProject?.title?.toLowerCase() ?? "").includes(
        searchText.toLowerCase()
      );

    return matchesFilter && matchesSearch;
  });

  return (
    <SafeAreaView className="flex-1">
      <FlatList
        ListHeaderComponent={
          <View>
            {/* Header Section */}
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-2xl font-bold">Invoices</Text>
                <Text className="text-gray-600">
                  {filteredInvoices.length} active invoices
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/screens/admin/createInvoice")}
                className="flex-row items-center gap-2 bg-primary px-4 py-3 rounded-xl"
              >
                <MaterialIcons name="add" size={20} color="white" />
                <Text className="font-medium text-white">New Invoice</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <InputField
              placeholder="Search by invoice reference or project title"
              value={searchText}
              onChangeText={setSearchText}
              icon="search"
            />

            {/* Invoice Status Filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6"
            >
              <View className="flex-row gap-2 p-1">
                {statusOptions.map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setSelectedStatus(status)}
                    className={`px-6 py-3 rounded-xl shadow-sm ${
                      selectedStatus === status ? "bg-primary" : "bg-white"
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
        }
        data={filteredInvoices}
        renderItem={({ item }) => <InvoiceCard item={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerClassName="container my-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchInvoices} />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500">
              {searchText || selectedStatus !== "All"
                ? "No invoices match your filters"
                : "No invoices found"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Invoices;
