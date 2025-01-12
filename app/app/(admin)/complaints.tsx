import React from "react";
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

interface Complaint {
  id: string;
  title: string;
  department: string;
  date: string;
  status: "Pending" | "Resolved" | "In Progress";
}

const Complaints = () => {
  const complaints: Complaint[] = [
    {
      id: "1",
      title: "Network Connectivity Issue",
      department: "IT Support",
      date: "Dec 28, 2024",
      status: "Pending",
    },
    {
      id: "2",
      title: "Broken Air Conditioner",
      department: "Facilities",
      date: "Dec 20, 2024",
      status: "In Progress",
    },
  ];

  const ComplaintCard = ({ complaint }: { complaint: Complaint }) => (
    <View className="border-l-4 border-primary p-6 bg-white rounded-2xl shadow-sm">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 pr-4">
          <Text className="text-lg font-bold mb-1">{complaint.title}</Text>
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="business" size={16} color="#6b7280" />
            <Text className="text-gray-600">{complaint.department}</Text>
          </View>
        </View>
        <View
          className={`px-4 py-2 rounded-xl ${
            complaint.status === "Pending"
              ? "bg-yellow-100"
              : complaint.status === "In Progress"
              ? "bg-blue-100"
              : "bg-green-100"
          }`}
        >
          <Text
            className={
              complaint.status === "Pending"
                ? "text-yellow-600"
                : complaint.status === "In Progress"
                ? "text-blue-600"
                : "text-green-600"
            }
          >
            {complaint.status}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center gap-2">
        <MaterialIcons name="schedule" size={16} color="#A82F39" />
        <Text className="text-gray-600">{complaint.date}</Text>
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
                  {complaints.length} active complaints
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
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6"
            >
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
        data={complaints}
        renderItem={({ item }) => <ComplaintCard complaint={item} />}
        keyExtractor={(item) => item.id}
        contentContainerClassName="container my-6 gap-6"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Complaints;
