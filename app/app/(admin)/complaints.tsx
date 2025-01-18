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
import ComplaintCard from "@/components/complaints/card";

type ComplaintStatus =
  | "Pending"
  | "In Progress"
  | "Resolved"
  | "Closed"
  | "All";

const statusOptions: ComplaintStatus[] = [
  "All",
  "Pending",
  "In Progress",
  "Resolved",
  "Closed",
];

const Complaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>("All");

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
    const matchesFilter =
      selectedStatus === "All" || complaint.status === selectedStatus;

    const matchesSearch =
      complaint.title.toLowerCase().includes(searchText.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchText.toLowerCase());

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
                <Text className="font-medium text-white">New Complaint</Text>
              </TouchableOpacity>
            </View>
            <InputField
              placeholder="Search by title or description"
              value={searchText}
              onChangeText={setSearchText}
              icon="search"
            />
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
        data={filteredComplaints}
        renderItem={({ item }) => <ComplaintCard item={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerClassName="container my-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchComplaints} />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500">
              {searchText || selectedStatus !== "All"
                ? "No complaints match your filters"
                : "No complaints found"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Complaints;
