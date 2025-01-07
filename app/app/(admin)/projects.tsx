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

interface Project {
  id: string;
  title: string;
  client: string;
  deadline: string;
  status: "In Progress" | "On Hold" | "Completed";
}

const Projects = () => {
  const projects: Project[] = [
    {
      id: "1",
      title: "Website Redesign",
      client: "Tech Corp",
      deadline: "Jan 15, 2025",
      status: "In Progress",
    },
    {
      id: "2",
      title: "Mobile App Development",
      client: "StartUp Inc",
      deadline: "Feb 28, 2025",
      status: "On Hold",
    },
  ];

  const ProjectCard = ({ project }: { project: Project }) => (
    <View className="border-l-4 border-primary p-6 bg-white rounded-2xl shadow-sm">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 pr-4">
          <Text className="text-lg font-bold mb-1">{project.title}</Text>
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="business" size={16} color="#6b7280" />
            <Text className="text-gray-600">{project.client}</Text>
          </View>
        </View>
        <View
          className={`px-4 py-2 rounded-xl ${
            project.status === "In Progress"
              ? "bg-blue-100"
              : project.status === "On Hold"
              ? "bg-yellow-100"
              : "bg-green-100"
          }`}
        >
          <Text
            className={
              project.status === "In Progress"
                ? "text-blue-600"
                : project.status === "On Hold"
                ? "text-yellow-600"
                : "text-green-600"
            }
          >
            {project.status}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center gap-2">
        <MaterialIcons name="schedule" size={16} color="#A82F39" />
        <Text className="text-gray-600">{project.deadline}</Text>
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
                <Text className="text-2xl font-bold mb-1">Projects</Text>
                <Text className="text-gray-600">
                  {projects.length} active projects
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/createProject")}
                className="flex-row items-center gap-2 bg-primary px-4 py-3 rounded-xl"
              >
                <MaterialIcons name="add" size={20} color="white" />
                <Text className="font-medium" style={{ color: "#fff" }}>
                  New Project
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
                  <Text className="text-gray-600">In Progress</Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-6 py-3 bg-white rounded-xl shadow-sm">
                  <Text className="text-gray-600">On Hold</Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-6 py-3 bg-white rounded-xl shadow-sm">
                  <Text className="text-gray-600">Completed</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        }
        data={projects}
        renderItem={({ item }) => <ProjectCard project={item} />}
        keyExtractor={(item) => item.id}
        contentContainerClassName="container my-6 gap-6"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Projects;
