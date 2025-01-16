import React from "react";
import {
  FlatList,
  ScrollView,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { SafeAreaView } from "react-native-safe-area-context";
import ComplaintCard from "@/components/complaints/card";
import StatCard from "@/components/dashboard/statCard";
import Chart from "@/components/dashboard/chart";
import useAuthStore from "@/store/authStore";

const Dashboard = () => {
  const { user } = useAuthStore();
  const summaryData = {
    projects: 99,
    complaints: 99,
    invoices: 99,
  };

  const projects = [
    { created_at: "2024-01-01" },
    { created_at: "2024-01-01" },
    { created_at: "2024-01-01" },
    { created_at: "2024-01-02" },
    { created_at: "2024-01-02" },
    { created_at: "2024-01-03" },
    { created_at: "2024-01-03" },
    { created_at: "2024-01-03" },
    { created_at: "2024-01-03" },
    { created_at: "2024-01-04" },
    { created_at: "2024-01-04" },
    { created_at: "2024-01-05" },
    { created_at: "2024-01-05" },
    { created_at: "2024-01-05" },
    { created_at: "2024-01-06" },
    { created_at: "2024-01-07" },
    { created_at: "2024-01-07" },
    { created_at: "2024-02-01" },
    { created_at: "2024-03-01" },
    { created_at: "2024-03-02" },
    { created_at: "2024-03-03" },
    { created_at: "2024-03-03" },
    { created_at: "2024-03-04" },
    { created_at: "2024-03-05" },
    { created_at: "2024-03-05" },
    { created_at: "2024-03-05" },
  ];

  const complaints = [
    { created_at: "2024-01-01" },
    { created_at: "2024-01-02" },
    { created_at: "2024-01-02" },
    { created_at: "2024-01-03" },
    { created_at: "2024-01-04" },
    { created_at: "2024-01-04" },
    { created_at: "2024-01-04" },
    { created_at: "2024-01-05" },
    { created_at: "2024-01-06" },
    { created_at: "2024-01-06" },
    { created_at: "2024-01-07" },
    { created_at: "2024-02-01" },
    { created_at: "2024-02-01" },
    { created_at: "2024-02-02" },
    { created_at: "2024-02-03" },
    { created_at: "2024-02-04" },
    { created_at: "2024-02-04" },
    { created_at: "2024-02-05" },
    { created_at: "2024-03-05" },
    { created_at: "2024-03-05" },
    { created_at: "2024-03-05" },
    { created_at: "2024-03-05" },
    { created_at: "2024-03-05" },
    { created_at: "2024-03-05" },
  ];
  const recentComplaints: Partial<Complaint>[] = [
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

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 w-full container py-6"
      >
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-2xl font-bold">Dashboard</Text>
            <Text className="text-gray-600">Welcome back, {user?.name}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/screens/profile")}
            className="flex-row items-center gap-2 bg-primary px-4 py-3 rounded-xl"
          >
            <FontAwesome5 name="user-alt" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={[
            {
              title: "Active Projects",
              value: summaryData.projects,
              icon: "folder-open",
            },
            {
              title: "Total Complaints",
              value: summaryData.complaints,
              icon: "report-gmailerrorred",
            },
            {
              title: "Pending Invoices",
              value: summaryData.invoices,
              icon: "receipt-long",
            },
          ]}
          renderItem={({ item }) => (
            <StatCard title={item.title} value={item.value} icon={item.icon} />
          )}
          keyExtractor={(item) => item.title}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="mb-8 p-1 gap-4"
        />
        <Chart projects={projects} complaints={complaints} />
        <View className="my-6 flex-row justify-between items-center">
          <Text className="text-xl font-bold">Recent Complaints</Text>
          <TouchableOpacity className="flex-row items-center gap-2">
            <Text>View All</Text>
            <View className="animate-bounceX">
              <MaterialIcons name="arrow-forward" size={20} color="#A82F39" />
            </View>
          </TouchableOpacity>
        </View>

        <View className="flex-col gap-4 mb-20">
          {recentComplaints.map((item) => (
            <ComplaintCard key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;
