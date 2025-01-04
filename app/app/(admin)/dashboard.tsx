import React from "react";
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
} from "react-native";
import { Text, Card, Divider } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { LineChart, XAxis, Line } from "recharts";

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
}

interface Complaint {
  id: string;
  title: string;
  assignedTo: string;
  date: string;
  status: string;
  description: string;
}

const Dashboard = () => {
  const summaryData = {
    projects: 99,
    complaints: 99,
    invoices: 99,
  };

  const chartData = [
    { name: "Mon", value: 65 },
    { name: "Tue", value: 59 },
    { name: "Wed", value: 80 },
    { name: "Thu", value: 81 },
    { name: "Fri", value: 56 },
    { name: "Sat", value: 55 },
    { name: "Sun", value: 40 },
  ];

  const recentComplaints = [
    {
      id: "1",
      title: "Delayed Project",
      assignedTo: "Client A",
      date: "Dec 23rd, 2024",
      status: "On Going",
      description: "Project timeline exceeded by 2 weeks",
    },
    {
      id: "2",
      title: "Budget Exceeded",
      assignedTo: "Client B",
      date: "Dec 18th, 2024",
      status: "Pending",
      description: "Budget overrun by 15%",
    },
  ];

  const StatCard = ({ title, value, icon }: StatCardProps) => (
    <Card>
      <Card.Content className="bg-white p-6 rounded-2xl justify-center items-center gap-3">
        <MaterialIcons name={icon as any} size={24} color="#A82F39" />
        <Text>{title}</Text>
        <Text className="text-4xl font-bold">{value}</Text>
      </Card.Content>
    </Card>
  );

  const ComplaintCard = ({ item }: { item: Complaint }) => (
    <Card className="border-l-4 border-primary">
      <Card.Content className="p-6 bg-white rounded-2xl">
        <View className="flex-row justify-between items-start mb-4">
          <View>
            <Text className="text-xl font-bold mb-2">{item.title}</Text>
            <Text>{item.description}</Text>
          </View>
          <View
            className={`px-4 py-2 rounded-xl ${
              item.status === "Pending" ? "bg-red-100" : "bg-yellow-100"
            }`}
          >
            <Text
              className={
                item.status === "Pending" ? "text-red-600" : "text-yellow-700"
              }
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <MaterialIcons name="person" size={16} color="#A82F39" />
          <Text>{item.assignedTo}</Text>
        </View>

        <Divider className="my-4" />

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="calendar-today" size={20} color="#4b5563" />
            <Text>{item.date}</Text>
          </View>
          <TouchableOpacity className="flex-row items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
            <Text>Details</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#A82F39" />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 w-full container my-6"
      >
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-2xl font-pmedium mb-1">Dashboard</Text>
            <Text className="text-gray-600">Welcome back, Admin</Text>
          </View>
          <TouchableOpacity className="p-3 bg-primary/80 rounded-xl">
            <MaterialIcons name="menu" size={24} color="white" />
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
          contentContainerClassName="mb-8 p-1 gap-2"
        />

        <Card>
          <Card.Content className="p-6 bg-white rounded-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold">Activity Overview</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity className="px-4 py-2 bg-primary/20 rounded-lg">
                  <Text>Weekly</Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-4 py-2">
                  <Text>Monthly</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View className="h-64">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <XAxis dataKey="name" />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={3}
                />
              </LineChart>
            </View>
          </Card.Content>
        </Card>

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
