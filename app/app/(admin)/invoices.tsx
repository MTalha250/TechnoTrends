import React from "react";
import {
  SafeAreaView,
  FlatList,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Text, Card } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

interface Invoice {
  id: string;
  title: string;
  client: string;
  dueDate: string;
  amount: string;
  status: "Pending" | "Paid" | "Overdue";
}

const Invoices = () => {
  const invoices: Invoice[] = [
    {
      id: "1",
      title: "Website Redesign Invoice",
      client: "Tech Corp",
      dueDate: "Jan 15, 2025",
      amount: "$1,500",
      status: "Pending",
    },
    {
      id: "2",
      title: "Mobile App Development Invoice",
      client: "StartUp Inc",
      dueDate: "Dec 20, 2024",
      amount: "$3,200",
      status: "Overdue",
    },
  ];

  const InvoiceCard = ({ invoice }: { invoice: Invoice }) => (
    <Card className="border-l-4 border-primary">
      <Card.Content className="p-6 bg-white rounded-2xl">
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1 pr-4">
            <Text className="text-lg font-bold mb-1">{invoice.title}</Text>
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="business" size={16} color="#6b7280" />
              <Text className="text-gray-600">{invoice.client}</Text>
            </View>
          </View>
          <View
            className={`px-4 py-2 rounded-xl ${
              invoice.status === "Pending"
                ? "bg-yellow-100"
                : invoice.status === "Paid"
                ? "bg-green-100"
                : "bg-red-100"
            }`}
          >
            <Text
              className={
                invoice.status === "Pending"
                  ? "text-yellow-600"
                  : invoice.status === "Paid"
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {invoice.status}
            </Text>
          </View>
        </View>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="schedule" size={16} color="#A82F39" />
            <Text className="text-gray-600">{invoice.dueDate}</Text>
          </View>
          <Text className="text-lg font-bold text-gray-800">
            {invoice.amount}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1">
      <FlatList
        ListHeaderComponent={
          <View>
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-2xl mb-1">Invoices</Text>
                <Text className="text-gray-600">
                  {invoices.length} active invoices
                </Text>
              </View>
              <TouchableOpacity className="flex-row items-center gap-2 bg-primary/80 px-4 py-3 rounded-xl">
                <MaterialIcons name="add" size={20} color="white" />
                <Text className="font-medium" style={{ color: "#fff" }}>
                  New Invoice
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6"
            >
              <View className="flex-row gap-2 p-1">
                <TouchableOpacity className="px-6 py-3 bg-primary/10 rounded-xl shadow-sm">
                  <Text className="text-primary font-medium">All</Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-6 py-3 bg-white rounded-xl shadow-sm">
                  <Text className="text-gray-600">Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-6 py-3 bg-white rounded-xl shadow-sm">
                  <Text className="text-gray-600">Paid</Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-6 py-3 bg-white rounded-xl shadow-sm">
                  <Text className="text-gray-600">Overdue</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        }
        data={invoices}
        renderItem={({ item }) => <InvoiceCard invoice={item} />}
        keyExtractor={(item) => item.id}
        contentContainerClassName="container my-6 gap-6"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Invoices;
