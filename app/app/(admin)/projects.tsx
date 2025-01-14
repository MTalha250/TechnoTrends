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
import ProjectCard from "@/components/projects/card";

const Projects = () => {
  const allProjects: Partial<Project>[] = [
    {
      id: 1,
      title: "Website Redesign",
      description: "Redesign the company website",
      clientName: "Tech Corp",
      dueDate: new Date("2024-12-23"),
      status: "In Progress",
    },
    {
      id: 2,
      title: "Mobile App Development",
      description: "Develop a mobile app for the client",
      clientName: "App Solutions",
      dueDate: new Date("2024-12-23"),
      status: "On Hold",
    },
  ];

  const [searchText, setSearchText] = useState("");
  const [filteredProjects, setFilteredProjects] = useState(allProjects);

  const handleSearch = (text: string) => {
    setSearchText(text);
    const filtered = allProjects.filter(
      (project) =>
        project.title?.toLowerCase().includes(text.toLowerCase()) ||
        project.description?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredProjects(filtered);
  };
  return (
    <SafeAreaView className="flex-1">
      <FlatList
        ListHeaderComponent={
          <View>
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-2xl font-bold">Projects</Text>
                <Text className="text-gray-600">
                  {filteredProjects.length} active projects
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/screens/admin/createProject")}
                className="flex-row items-center gap-2 bg-primary px-4 py-3 rounded-xl"
              >
                <MaterialIcons name="add" size={20} color="white" />
                <Text className="font-medium" style={{ color: "#fff" }}>
                  New Project
                </Text>
              </TouchableOpacity>
            </View>
            <InputField
              placeholder="Search by project title or description"
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
        data={filteredProjects}
        renderItem={({ item }) => <ProjectCard item={item} />}
        keyExtractor={(item) => item.id?.toString() || ""}
        contentContainerClassName="container my-6 gap-6"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Projects;
