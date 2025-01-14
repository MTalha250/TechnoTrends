import React, { useState } from "react";
import {
  FlatList,
  View,
  TouchableOpacity,
  ScrollView,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import InputField from "@/components/inputField";
import ComplaintCard from "@/components/complaints/card";

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

  return (
    <SafeAreaView className="flex-1">
      <FlatList
        ListHeaderComponent={
          <View>
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-2xl font-bold">Complaints</Text>
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
