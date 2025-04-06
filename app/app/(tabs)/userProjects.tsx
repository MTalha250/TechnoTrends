import React, { useEffect, useState } from "react";
import {
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
import axios from "axios";
import useAuthStore from "@/store/authStore";

const statusOptions = [
  "All",
  "Pending",
  "In Progress",
  "Completed",
  "Cancelled",
];

// Helper function to format dates
const formatDate = (date: Date | null | string): string => {
  if (!date) return "No date";

  if (typeof date === "string") {
    date = new Date(date);
  }

  return date instanceof Date
    ? date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "None";
};

const hasValue = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
};

const ProjectTableHeader = () => {
  return (
    <View className="flex-row bg-gray-100 py-4 border-b border-gray-200 rounded-t-xl shadow-sm">
      <Text className="w-40 font-bold px-3 mx-1 text-gray-800">Client</Text>
      <Text className="w-32 font-bold px-3 mx-1 text-gray-800">Survey</Text>
      <Text className="w-32 font-bold px-3 mx-1 text-gray-800">Quotation</Text>
      <Text className="w-32 font-bold px-3 mx-1 text-gray-800">PO</Text>
      <Text className="w-32 font-bold px-3 mx-1 text-gray-800">DC</Text>
      <Text className="w-32 font-bold px-3 mx-1 text-gray-800">JC</Text>
      <Text className="w-56 font-bold px-3 mx-1 text-gray-800">Remarks</Text>
      <Text className="w-40 font-bold px-3 mx-1 text-gray-800">Status</Text>
    </View>
  );
};

const ProjectTableRow = ({ item, index }: { item: Project; index: number }) => {
  const isEvenRow = index % 2 === 0;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/screens/project/${item.id}`)}
      className={`flex-row py-4 border-b border-gray-200 items-center ${
        isEvenRow ? "bg-white" : "bg-gray-50"
      }`}
    >
      <View className="w-40 px-3">
        <Text numberOfLines={1} className="text-gray-800 text-lg font-medium">
          {item.clientName}
        </Text>
        <Text numberOfLines={1} className="text-xs text-gray-500">
          {item.description || "No description"}
        </Text>
      </View>

      <View
        className={`w-32 px-3 py-2 ${
          hasValue(item.surveyDate) ? "bg-green-50" : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.surveyDate) ? "border-green-100" : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.surveyDate) ? "text-green-700" : "text-red-700"
          } font-medium text-nowrap`}
        >
          {formatDate(item.surveyDate)}
        </Text>
        {item.surveyPhotos && item.surveyPhotos.length > 0 ? (
          <Text
            numberOfLines={1}
            className="text-xs text-gray-500 mt-1 flex-row items-center"
          >
            <MaterialIcons
              name="photo-library"
              size={12}
              color="#6B7280"
              className="mr-1"
            />
            {item.surveyPhotos.length} photos
          </Text>
        ) : (
          <Text className="text-xs text-gray-500 mt-1">No photos</Text>
        )}
      </View>

      <View
        className={`w-32 h-full px-3 py-2 ${
          hasValue(item.quotationReference) && hasValue(item.quotationDate)
            ? "bg-green-50"
            : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.quotationReference) && hasValue(item.quotationDate)
            ? "border-green-100"
            : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.quotationReference)
              ? "text-green-700"
              : "text-red-700"
          } font-medium`}
        >
          {item.quotationReference || "None"}
        </Text>
        <Text numberOfLines={1} className="text-xs text-gray-500 mt-1">
          {formatDate(item.quotationDate)}
        </Text>
      </View>

      <View
        className={`w-32 px-3 py-2 ${
          hasValue(item.poNumber) && hasValue(item.poDate)
            ? "bg-green-50"
            : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.poNumber) && hasValue(item.poDate)
            ? "border-green-100"
            : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.poNumber) ? "text-green-700" : "text-red-700"
          } font-medium`}
        >
          {item.poNumber || "None"}
        </Text>
        <Text numberOfLines={1} className="text-xs text-gray-500 mt-1">
          {formatDate(item.poDate)}
        </Text>
      </View>

      <View
        className={`w-32 px-3 py-2 ${
          hasValue(
            item.dcReferences[item.dcReferences.length - 1]?.dcReference
          ) && hasValue(item.dcReferences[item.dcReferences.length - 1]?.dcDate)
            ? "bg-green-50"
            : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(
            item.dcReferences[item.dcReferences.length - 1]?.dcReference
          ) && hasValue(item.dcReferences[item.dcReferences.length - 1]?.dcDate)
            ? "border-green-100"
            : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(
              item.dcReferences[item.dcReferences.length - 1]?.dcReference
            )
              ? "text-green-700"
              : "text-red-700"
          } font-medium`}
        >
          {item.dcReferences[item.dcReferences.length - 1]?.dcReference ||
            "None"}
        </Text>
        <Text numberOfLines={1} className="text-xs text-gray-500 mt-1">
          {formatDate(item.dcReferences[item.dcReferences.length - 1]?.dcDate)}
        </Text>
      </View>

      <View
        className={`w-32 px-3 py-2 ${
          hasValue(
            item.jcReferences[item.jcReferences.length - 1]?.jcReference
          ) && hasValue(item.jcReferences[item.jcReferences.length - 1]?.jcDate)
            ? "bg-green-50"
            : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(
            item.jcReferences[item.jcReferences.length - 1]?.jcReference
          ) && hasValue(item.jcReferences[item.jcReferences.length - 1]?.jcDate)
            ? "border-green-100"
            : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(
              item.jcReferences[item.jcReferences.length - 1]?.jcReference
            )
              ? "text-green-700"
              : "text-red-700"
          } font-medium`}
        >
          {item.jcReferences[item.jcReferences.length - 1]?.jcReference ||
            "None"}
        </Text>
        <Text numberOfLines={1} className="text-xs text-gray-500 mt-1">
          {formatDate(item.jcReferences[item.jcReferences.length - 1]?.jcDate)}
        </Text>
      </View>

      <View
        className={`w-56 px-3 py-2 ${
          hasValue(item.remarks) ? "bg-green-50" : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.remarks) ? "border-green-100" : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.remarks) ? "text-green-700" : "text-red-700"
          } font-medium`}
        >
          {item.remarks || "None"}
        </Text>
        <Text numberOfLines={1} className="text-xs text-gray-500 mt-1">
          {formatDate(item.remarksDate)}
        </Text>
      </View>

      <View className="w-40 px-3">
        <View
          className={`py-2 px-3 rounded-full ${
            item.status === "Completed"
              ? "bg-green-100"
              : item.status === "In Progress"
              ? "bg-blue-100"
              : item.status === "Pending"
              ? "bg-yellow-100"
              : "bg-red-100"
          }`}
        >
          <Text
            numberOfLines={1}
            className={`text-xs text-center font-semibold ${
              item.status === "Completed"
                ? "text-green-800"
                : item.status === "In Progress"
                ? "text-blue-800"
                : item.status === "Pending"
                ? "text-yellow-800"
                : "text-red-800"
            }`}
          >
            {item.status}
          </Text>
        </View>
        <View className="flex-row items-center mt-2">
          <MaterialIcons name="event" size={12} color="#6B7280" />
          <Text numberOfLines={1} className="text-xs text-gray-500 ml-1">
            Due: {formatDate(item.dueDate)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const UserProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const { user } = useAuthStore();

  const fetchProjects = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get<Project[]>(
        `${process.env.EXPO_PUBLIC_API_URL}/assigned/projects/user/${user?.id}`
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
  }, [user?.id]);

  const filteredProjects = projects.filter((project) => {
    const matchesFilter =
      selectedStatus === "All" || project.status === selectedStatus;
    const matchesSearch =
      project.clientName.toLowerCase().includes(searchText.toLowerCase()) ||
      (project.description?.toLowerCase() || "").includes(
        searchText.toLowerCase()
      );
    return matchesFilter && matchesSearch;
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchProjects} />
        }
      >
        <View className="flex-1">
          <View className="container my-6">
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-2xl font-bold text-gray-800">
                  Projects
                </Text>
                <Text className="text-gray-600">
                  {filteredProjects.length} active projects
                </Text>
              </View>
            </View>

            {/* Filter and Search Section */}
            <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
              {/* Search Input */}
              <InputField
                placeholder="Search by client or description"
                value={searchText}
                onChangeText={setSearchText}
                icon="search"
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-2"
              >
                <View className="flex-row gap-2 p-1">
                  {statusOptions.map((status) => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => setSelectedStatus(status)}
                      accessibilityRole="button"
                      className={`px-6 py-3 rounded-xl ${
                        selectedStatus === status ? "bg-primary" : "bg-gray-100"
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

            {/* Table View */}
            <View className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="min-w-full">
                  <ProjectTableHeader />
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project, index) => (
                      <ProjectTableRow
                        key={project.id.toString()}
                        item={project}
                        index={index}
                      />
                    ))
                  ) : (
                    <View className="py-12 items-center justify-center bg-white">
                      <MaterialIcons
                        name="error-outline"
                        size={32}
                        color="#9CA3AF"
                      />
                      <Text className="text-gray-500 mt-2 text-center font-medium">
                        {searchText || selectedStatus !== "All"
                          ? "No projects match your filters"
                          : "No projects found"}
                      </Text>
                      <Text className="text-gray-400 text-sm mt-1 text-center">
                        {searchText || selectedStatus !== "All"
                          ? "Try adjusting your search or filters"
                          : "Create a new project to get started"}
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProjects;
