import React from "react";
import { SafeAreaView, ScrollView, View, TouchableOpacity } from "react-native";
import { Text, Card } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

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
    <Card className="mb-6 rounded-2xl shadow-lg overflow-hidden">
      <Card.Content className="p-6 bg-gradient-to-br from-white to-gray-50">
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-1 pr-4">
            <Text className="text-2xl font-bold mb-2">{project.title}</Text>
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="business" size={16} color="#666" />
              <Text className="text-gray-600">{project.client}</Text>
            </View>
          </View>
          <View
            className={`px-4 py-2 rounded-xl shadow-sm ${
              project.status === "In Progress"
                ? "bg-blue-500"
                : project.status === "On Hold"
                ? "bg-amber-500"
                : "bg-green-500"
            }`}
          >
            <Text className="text-white font-medium">{project.status}</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <MaterialIcons name="schedule" size={16} color="#A82F39" />
          <Text className="font-medium">{project.deadline}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-3xl font-bold bg-gradient-to-r from-primary to-red-700 bg-clip-text text-transparent">
              Projects
            </Text>
            <Text className="text-gray-600">
              {projects.length} active projects
            </Text>
          </View>
          <TouchableOpacity className="flex-row items-center gap-2 bg-gradient-to-r from-primary to-red-700 px-6 py-3 rounded-2xl shadow-lg">
            <MaterialIcons name="add" size={20} color="white" />
            <Text className="text-white font-medium">New Project</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-8"
        >
          <View className="flex-row gap-3">
            <TouchableOpacity className="px-6 py-3 bg-gradient-to-r from-primary to-red-700 rounded-xl shadow-sm">
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

        <View className="flex-col">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Projects;
