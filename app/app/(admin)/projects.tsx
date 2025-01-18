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
import InputField from "@/components/inputField";
import ProjectCard from "@/components/projects/card";
import axios from "axios";

type ProjectStatus =
  | "Pending"
  | "In Progress"
  | "On Hold"
  | "Completed"
  | "Cancelled"
  | "All";

const statusOptions: ProjectStatus[] = [
  "All",
  "Pending",
  "In Progress",
  "On Hold",
  "Completed",
  "Cancelled",
];

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>("All");

  const fetchProjects = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get<Project[]>(
        `${process.env.EXPO_PUBLIC_API_URL}/projects`
      );
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesFilter =
      selectedStatus === "All" || project.status === selectedStatus;
    const matchesSearch =
      project.title.toLowerCase().includes(searchText.toLowerCase()) ||
      project.description.toLowerCase().includes(searchText.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
                <Text className="font-medium text-white">New Project</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <InputField
              placeholder="Search by project title or description"
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
        data={filteredProjects}
        renderItem={({ item }) => <ProjectCard item={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchProjects} />
        }
        keyExtractor={(item) => item.id.toString()}
        contentContainerClassName="container my-6"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500">
              {searchText || selectedStatus !== "All"
                ? "No projects match your filters"
                : "No projects found"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Projects;
