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

const UserDashboard = () => {
  const { user, token } = useAuthStore();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<
    Partial<Complaint>[]
  >([]);
  const [recentProjects, setRecentProjects] = useState<Partial<Project>[]>([]);
  const [recentMaintenances, setRecentMaintenances] = useState<
    Partial<Maintenance>[]
  >([]);
  const [summaryData, setSummaryData] = useState({
    projects: 0,
    complaints: 0,
    maintenances: 0,
  });

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/dashboard/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComplaints(response.data.userComplaints || []);
      setProjects(response.data.userProjects || []);
      setMaintenances(response.data.userMaintenances || []);

      setRecentComplaints(response.data.recentComplaints || []);
      setRecentProjects(response.data.recentProjects || []);
      setRecentMaintenances(response.data.recentMaintenances || []);
      setSummaryData({
        projects: response.data.activeProjects || 0,
        complaints: response.data.activeComplaints || 0,
        maintenances: response.data.activeMaintenances || 0,
      });
    } catch (error) {
      console.log("Error fetching user dashboard data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?._id]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 w-full container py-6"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
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
              title: "Assigned Projects",
              value: summaryData.projects,
              icon: "folder-open",
            },
            {
              title: "Assigned Complaints",
              value: summaryData.complaints,
              icon: "report-gmailerrorred",
            },
            {
              title: "Assigned Maintenances",
              value: summaryData.maintenances,
              icon: "build",
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
        <Chart
          projects={projects as any}
          complaints={complaints as any}
          maintenances={maintenances as any}
        />
        <View className="my-6 flex-row justify-between items-center">
          <Text className="text-xl font-bold">Recent Projects</Text>
          <TouchableOpacity
            className="flex-row items-center gap-2"
            onPress={() => router.push("/userProjects")}
          >
            <Text>View All</Text>
            <View className="animate-bounceX">
              <MaterialIcons name="arrow-forward" size={20} color="#A82F39" />
            </View>
          </TouchableOpacity>
        </View>
        <View className="flex-col gap-4">
          {recentProjects.map((item) => (
            <ProjectCard key={item._id} item={item} />
          ))}
        </View>
        <View className="my-6 flex-row justify-between items-center">
          <Text className="text-xl font-bold">Recent Complaints</Text>
          <TouchableOpacity
            className="flex-row items-center gap-2"
            onPress={() => router.push("/userComplaints")}
          >
            <Text>View All</Text>
            <View className="animate-bounceX">
              <MaterialIcons name="arrow-forward" size={20} color="#A82F39" />
            </View>
          </TouchableOpacity>
        </View>

        <View className="flex-col gap-4">
          {recentComplaints.map((item) => (
            <ComplaintCard key={item._id} item={item} />
          ))}
        </View>

        <View className="my-6 flex-row justify-between items-center">
          <Text className="text-xl font-bold">Recent Maintenances</Text>
          <TouchableOpacity
            className="flex-row items-center gap-2"
            onPress={() => router.push("/userMaintenances")}
          >
            <Text>View All</Text>
            <View className="animate-bounceX">
              <MaterialIcons name="arrow-forward" size={20} color="#A82F39" />
            </View>
          </TouchableOpacity>
        </View>

        <View className="flex-col gap-4 mb-20">
          {recentMaintenances.map((item) => (
            <View
              key={item._id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-800">
                    {item.clientName}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {item.serviceDates?.length || 0} service dates
                  </Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${
                    item.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : item.status === "In Progress"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  <Text className="text-xs font-medium">{item.status}</Text>
                </View>
              </View>
              {item.remarks?.value && (
                <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                  {item.remarks.value}
                </Text>
              )}
              <TouchableOpacity
                onPress={() => router.push(`/screens/maintenance/${item._id}`)}
                className="bg-primary rounded-xl py-2 px-4 self-start"
              >
                <Text className="text-white font-medium text-sm">
                  View Details
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserDashboard;
