import React, { useState } from "react";
import {
  FlatList,
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  TextInput,
} from "react-native";
import { Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import InputField from "@/components/inputField";

const Complaints = () => {
  const allComplaints: Partial<Complaint>[] = [
    {
      id: 1,
      title: "Delayed Project",
      clientName: "Client A",
      dueDate: new Date("2024-12-23"),
      status: "Pending",
      description: "Project timeline exceeded by 2 weeks",
    },
    {
      id: 2,
      title: "Budget Exceeded",
      clientName: "Client B",
      dueDate: new Date("2024-12-23"),
      status: "In Progress",
      description: "Budget overrun by 15%",
    },
    {
      id: 3,
      title: "Delayed Project",
      clientName: "Client A",
      dueDate: new Date("2024-12-23"),
      status: "Resolved",
      description: "Project timeline exceeded by 2 weeks",
    },
    {
      id: 4,
      title: "Budget Exceeded",
      clientName: "Client B",
      dueDate: new Date("2024-12-23"),
      status: "Closed",
      description: "Budget overrun by 15%",
    },
  ];

  const [searchText, setSearchText] = useState("");
  const [filteredComplaints, setFilteredComplaints] = useState(allComplaints);

  const handleSearch = (text: string) => {
    setSearchText(text);
    const filtered = allComplaints.filter(
      (complaint) =>
        complaint.title?.toLowerCase().includes(text.toLowerCase()) ||
        complaint.description?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredComplaints(filtered);
  };

  const ComplaintCard = ({ item }: { item: Partial<Complaint> }) => (
    <View className="border-l-4 border-primary p-6 bg-white rounded-2xl shadow-sm">
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text className="text-xl font-bold mb-2">{item.title}</Text>
          <Text>{item.description}</Text>
        </View>
        <View
          className={`px-4 py-2 rounded-xl ${
            item.status === "Pending"
              ? "bg-yellow-100"
              : item.status === "In Progress"
              ? "bg-blue-100"
              : item.status === "Resolved"
              ? "bg-green-100"
              : "bg-red-100"
          }`}
        >
          <Text
            className={
              item.status === "Pending"
                ? "text-yellow-700"
                : item.status === "In Progress"
                ? "text-blue-700"
                : item.status === "Resolved"
                ? "text-green-700"
                : "text-red-700"
            }
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <MaterialIcons name="business" size={16} color="#A82F39" />
        <Text>{item.clientName}</Text>
      </View>

      <Divider className="my-4" />

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="calendar-today" size={20} color="#4b5563" />
          <Text>{item.dueDate?.toLocaleDateString()}</Text>
        </View>
        <TouchableOpacity
          // Add your navigation logic for complaint details here
          className="flex-row items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg"
        >
          <Text>Details</Text>
          <MaterialIcons name="arrow-forward" size={16} color="#A82F39" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1">
      <FlatList
        ListHeaderComponent={
          <View>
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-2xl font-bold mb-1">Complaints</Text>
                <Text className="text-gray-600">
                  {filteredComplaints.length} active complaints
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/screens/admin/createComplaint")}
                className="flex-row items-center gap-2 bg-primary px-4 py-3 rounded-xl"
              >
                <MaterialIcons name="add" size={20} color="white" />
                <Text className="font-medium" style={{ color: "#fff" }}>
                  New Complaint
                </Text>
              </TouchableOpacity>
            </View>
            <InputField
              placeholder="Search by title or description"
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
                  <Text className="text-gray-600">In Progress</Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-6 py-3 bg-white rounded-xl shadow-sm">
                  <Text className="text-gray-600">Resolved</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        }
        data={filteredComplaints}
        renderItem={({ item }) => <ComplaintCard item={item} />}
        keyExtractor={(item) => item.id?.toString() || ""}
        contentContainerClassName="container my-6 pb-20 gap-6"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Complaints;
