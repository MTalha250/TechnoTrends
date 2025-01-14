import React, { useState } from "react";
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
import InputField from "@/components/inputField";
import InvoiceCard from "@/components/invoices/card";

const Invoices = () => {
  const allInvoices: Partial<Invoice>[] = [
    {
      id: 1,
      invoiceReference: "INV-001",
      amount: "5000",
      paymentTerms: "Cash",
      dueDate: new Date("2024-12-23"),
      linkedProject: {
        id: 1,
        title: "Website Redesign",
      },
      status: "Paid",
    },
    {
      id: 2,
      invoiceReference: "INV-002",
      amount: "10000",
      paymentTerms: "Credit",
      creditDays: "30",
      dueDate: new Date("2024-12-23"),
      linkedProject: {
        id: 2,
        title: "Mobile App Development",
      },
      status: "Unpaid",
    },
  ];

  const [searchText, setSearchText] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState(allInvoices);

  const handleSearch = (text: string) => {
    setSearchText(text);
    const filtered = allInvoices.filter(
      (invoice) =>
        invoice.invoiceReference?.toLowerCase().includes(text.toLowerCase()) ||
        invoice.linkedProject?.title?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredInvoices(filtered);
  };

  return (
    <SafeAreaView className="flex-1">
      <FlatList
        ListHeaderComponent={
          <View>
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
                <Text className="font-medium" style={{ color: "#fff" }}>
                  New Invoice
                </Text>
              </TouchableOpacity>
            </View>
            <InputField
              placeholder="Search by invoice reference or project title"
              value={searchText}
              onChangeText={handleSearch}
              icon="search"
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2 p-1">
                <TouchableOpacity className="px-6 py-3 bg-primary rounded-xl shadow-sm">
                  <Text className="text-white font-medium">All</Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-6 py-3 bg-white rounded-xl shadow-sm">
                  <Text className="text-gray-600">Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-6 py-3 bg-white rounded-xl shadow-sm">
                  <Text className="text-gray-600">Paid</Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-6 py-3 bg-white rounded-xl shadow-sm">
                  <Text className="text-gray-600">Un Paid</Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-6 py-3 bg-white rounded-xl shadow-sm">
                  <Text className="text-gray-600">Overdue</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        }
        data={filteredInvoices}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => {}} />
        }
        renderItem={({ item }) => <InvoiceCard item={item} />}
        keyExtractor={(item) => item.id?.toString() || ""}
        contentContainerClassName="container my-6 gap-6"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Invoices;
