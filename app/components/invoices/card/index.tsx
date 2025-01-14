import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Divider } from "react-native-paper";

import React from "react";

const InvoiceCard = ({ item }: { item: Partial<Invoice> }) => {
  return (
    <View className="border-l-4 border-primary p-6 bg-white rounded-2xl shadow-sm">
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text className="text-xl font-bold mb-2">
            {item.invoiceReference}
          </Text>
          <Text>Amount: ${item.amount}</Text>
        </View>
        <View
          className={`px-4 py-2 h-10 rounded-xl ${
            item.status === "Paid"
              ? "bg-green-100"
              : item.status === "Unpaid"
              ? "bg-red-100"
              : "bg-blue-100"
          }`}
        >
          <Text
            className={
              item.status === "Paid"
                ? "text-green-700"
                : item.status === "Unpaid"
                ? "text-red-700"
                : "text-blue-700"
            }
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <MaterialIcons name="folder" size={16} color="#A82F39" />
        <Text>{item.linkedProject?.title || "No Project Linked"}</Text>
      </View>

      <Divider className="my-4" />

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="calendar-today" size={20} color="#4b5563" />
          <Text>{item.dueDate?.toLocaleDateString() || "No Due Date"}</Text>
        </View>
        <TouchableOpacity
          // onPress={() => router.push(`/screens/admin/invoice/${item.id}`)}
          className="flex-row items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg"
        >
          <Text>Details</Text>
          <MaterialIcons name="arrow-forward" size={16} color="#A82F39" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default InvoiceCard;
