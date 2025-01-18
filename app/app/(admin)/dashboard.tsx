import React, { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { SafeAreaView } from "react-native-safe-area-context";
import ComplaintCard from "@/components/complaints/card";
import StatCard from "@/components/dashboard/statCard";
import Chart from "@/components/dashboard/chart";
import useAuthStore from "@/store/authStore";
import axios from "axios";
import ProjectCard from "@/components/projects/card";

const Dashboard = () => {
  const { user, token } = useAuthStore();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [refresing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<
    Partial<Complaint>[]
  >([]);
  const [recentProjects, setRecentProjects] = useState<Partial<Project>[]>([]);
  const [summaryData, setSummaryData] = useState({
    projects: 0,
    complaints: 0,
    invoices: 0,
  });

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/dashboard/admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComplaints(response.data.all_complaints);
      setProjects(response.data.all_projects);
      setRecentComplaints(response.data.recent_complaints);
      setRecentProjects(response.data.recent_projects);
      setSummaryData({
        projects: response.data.total_projects,
        complaints: response.data.total_complaints,
        invoices: response.data.total_invoices,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 w-full container py-6"
        refreshControl={
          <RefreshControl
            refreshing={refresing}
            onRefresh={fetchDashboardData}
          />
        }
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
          <Text className="text-xl font-bold">Recent Projects</Text>
          <TouchableOpacity
            className="flex-row items-center gap-2"
            onPress={() => router.push("/projects")}
          >
            <Text>View All</Text>
            <View className="animate-bounceX">
              <MaterialIcons name="arrow-forward" size={20} color="#A82F39" />
            </View>
          </TouchableOpacity>
        </View>
        <View className="flex-col gap-4">
          {recentProjects.map((item) => (
            <ProjectCard key={item.id} item={item} />
          ))}
        </View>
        <View className="my-6 flex-row justify-between items-center">
          <Text className="text-xl font-bold">Recent Complaints</Text>
          <TouchableOpacity
            className="flex-row items-center gap-2"
            onPress={() => router.push("/complaints")}
          >
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
