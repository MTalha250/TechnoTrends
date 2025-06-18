import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  RefreshControl,
  Dimensions,
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
  if (typeof value === "object" && value.value && value.value.trim() === "")
    return false;
  return true;
};

const ProjectTableHeader = ({ isCompact }: { isCompact: boolean }) => {
  return (
    <View
      className={`flex-row bg-gray-100 border-b border-gray-200 rounded-t-xl shadow-sm ${
        isCompact ? "py-2" : "py-4"
      }`}
    >
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-28" : "w-40"
        }`}
      >
        Client
      </Text>
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-24" : "w-32"
        }`}
      >
        Survey
      </Text>
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-24" : "w-32"
        }`}
      >
        Quotation
      </Text>
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-24" : "w-32"
        }`}
      >
        PO
      </Text>
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-24" : "w-32"
        }`}
      >
        DC
      </Text>
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-24" : "w-32"
        }`}
      >
        JC
      </Text>
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-40" : "w-56"
        }`}
      >
        Remarks
      </Text>
      <Text
        className={`font-bold px-3 mx-1 text-gray-800 ${
          isCompact ? "text-sm w-28" : "w-40"
        }`}
      >
        Status
      </Text>
    </View>
  );
};

const ProjectTableRow = ({
  item,
  index,
  isCompact,
}: {
  item: Project;
  index: number;
  isCompact: boolean;
}) => {
  const isEvenRow = index % 2 === 0;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/screens/project/${item._id}`)}
      className={`flex-row border-b border-gray-200 items-center ${
        isCompact ? "py-2" : "py-4"
      } ${isEvenRow ? "bg-white" : "bg-gray-50"}`}
    >
      <View className={`${isCompact ? "w-28" : "w-40"} px-3`}>
        <Text
          numberOfLines={1}
          className={`text-gray-800 font-medium ${
            isCompact ? "text-sm" : "text-lg"
          }`}
        >
          {item.clientName}
        </Text>
        <Text
          numberOfLines={1}
          className={`text-gray-500 ${isCompact ? "text-xs" : "text-xs"}`}
        >
          {item.description || "No description"}
        </Text>
      </View>

      <View
        className={`${isCompact ? "w-24" : "w-32"} px-3 py-2 ${
          hasValue(item.surveyDate) ? "bg-green-50" : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.surveyDate) ? "border-green-100" : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.surveyDate) ? "text-green-700" : "text-red-700"
          } font-medium text-nowrap ${isCompact ? "text-xs" : "text-sm"}`}
        >
          {formatDate(item.surveyDate)}
        </Text>
        {item.surveyPhotos && item.surveyPhotos.length > 0 ? (
          <Text
            numberOfLines={1}
            className={`text-gray-500 flex-row items-center ${
              isCompact ? "text-xs mt-0" : "text-xs mt-1"
            }`}
          >
            <MaterialIcons
              name="photo-library"
              size={isCompact ? 10 : 12}
              color="#6B7280"
              className="mr-1"
            />
            {item.surveyPhotos.length} photos
          </Text>
        ) : (
          <Text
            className={`text-gray-500 ${
              isCompact ? "text-xs mt-0" : "text-xs mt-1"
            }`}
          >
            No photos
          </Text>
        )}
      </View>

      <View
        className={`${isCompact ? "w-24" : "w-32"} h-full px-3 py-2 ${
          hasValue(item.quotation?.value) ? "bg-green-50" : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.quotation?.value)
            ? "border-green-100"
            : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.quotation?.value) ? "text-green-700" : "text-red-700"
          } font-medium ${isCompact ? "text-xs" : "text-sm"}`}
        >
          {item.quotation?.value || "None"}
        </Text>
        <Text
          numberOfLines={1}
          className={`text-gray-500 ${
            isCompact ? "text-xs mt-0" : "text-xs mt-1"
          }`}
        >
          {formatDate(item.quotation?.updatedAt)}
        </Text>
      </View>

      <View
        className={`${isCompact ? "w-24" : "w-32"} px-3 py-2 ${
          hasValue(item.po?.value) ? "bg-green-50" : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.po?.value) ? "border-green-100" : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.po?.value) ? "text-green-700" : "text-red-700"
          } font-medium ${isCompact ? "text-xs" : "text-sm"}`}
        >
          {item.po?.value || "None"}
        </Text>
        <Text
          numberOfLines={1}
          className={`text-gray-500 ${
            isCompact ? "text-xs mt-0" : "text-xs mt-1"
          }`}
        >
          {formatDate(item.po?.updatedAt)}
        </Text>
      </View>

      <View
        className={`${isCompact ? "w-24" : "w-32"} px-3 py-2 ${
          hasValue(item.dcReferences[item.dcReferences.length - 1]?.value)
            ? "bg-green-50"
            : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.dcReferences[item.dcReferences.length - 1]?.value)
            ? "border-green-100"
            : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.dcReferences[item.dcReferences.length - 1]?.value)
              ? "text-green-700"
              : "text-red-700"
          } font-medium ${isCompact ? "text-xs" : "text-sm"}`}
        >
          {item.dcReferences[item.dcReferences.length - 1]?.value || "None"}
        </Text>
        <Text
          numberOfLines={1}
          className={`text-gray-500 ${
            isCompact ? "text-xs mt-0" : "text-xs mt-1"
          }`}
        >
          {formatDate(
            item.dcReferences[item.dcReferences.length - 1]?.updatedAt
          )}
        </Text>
      </View>

      <View
        className={`${isCompact ? "w-24" : "w-32"} px-3 py-2 ${
          hasValue(item.jcReferences[item.jcReferences.length - 1]?.value)
            ? "bg-green-50"
            : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.jcReferences[item.jcReferences.length - 1]?.value)
            ? "border-green-100"
            : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.jcReferences[item.jcReferences.length - 1]?.value)
              ? "text-green-700"
              : "text-red-700"
          } font-medium ${isCompact ? "text-xs" : "text-sm"}`}
        >
          {item.jcReferences[item.jcReferences.length - 1]?.value || "None"}
        </Text>
        <Text
          numberOfLines={1}
          className={`text-gray-500 ${
            isCompact ? "text-xs mt-0" : "text-xs mt-1"
          }`}
        >
          {formatDate(
            item.jcReferences[item.jcReferences.length - 1]?.updatedAt
          )}
        </Text>
      </View>

      <View
        className={`${isCompact ? "w-40" : "w-56"} px-3 py-2 ${
          hasValue(item.remarks?.value) ? "bg-green-50" : "bg-red-50"
        } rounded-lg mx-1 border ${
          hasValue(item.remarks?.value) ? "border-green-100" : "border-red-100"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`${
            hasValue(item.remarks?.value) ? "text-green-700" : "text-red-700"
          } font-medium ${isCompact ? "text-xs" : "text-sm"}`}
        >
          {item.remarks?.value || "None"}
        </Text>
        <Text
          numberOfLines={1}
          className={`text-gray-500 ${
            isCompact ? "text-xs mt-0" : "text-xs mt-1"
          }`}
        >
          {formatDate(item.remarks?.updatedAt)}
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
            className={`text-center font-semibold ${
              isCompact ? "text-xs" : "text-xs"
            } ${
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
        <View
          className={`flex-row items-center ${isCompact ? "mt-1" : "mt-2"}`}
        >
          <MaterialIcons
            name="event"
            size={isCompact ? 10 : 12}
            color="#6B7280"
          />
          <Text
            numberOfLines={1}
            className={`text-gray-500 ml-1 ${
              isCompact ? "text-xs" : "text-xs"
            }`}
          >
            Due: {formatDate(item.dueDate)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isLandscape, setIsLandscape] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const { token } = useAuthStore();

  const fetchProjects = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get<Project[]>(
        `${process.env.EXPO_PUBLIC_API_URL}/projects`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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

  useEffect(() => {
    const updateOrientation = () => {
      const { width, height } = Dimensions.get("window");
      setIsLandscape(width > height);
    };

    // Get initial orientation
    updateOrientation();

    // Listen for orientation changes
    const subscription = Dimensions.addEventListener(
      "change",
      updateOrientation
    );

    return () => {
      subscription?.remove();
    };
  }, []);

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
      <View className="flex-1 container my-6">
        {/* Header - Hidden in landscape */}
        {!isLandscape && (
          <View>
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-2xl font-bold text-gray-800">
                  Projects
                </Text>
                <Text className="text-gray-600">
                  {filteredProjects.length} projects
                </Text>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setIsCompactMode(!isCompactMode)}
                  className={`flex-row items-center gap-2 px-4 py-3 rounded-xl ${
                    isCompactMode ? "bg-blue-600" : "bg-gray-600"
                  }`}
                >
                  <MaterialIcons
                    name={isCompactMode ? "view-agenda" : "view-compact"}
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/screens/createProject")}
                  className="flex-row items-center gap-2 bg-primary px-4 py-3 rounded-xl"
                >
                  <MaterialIcons name="add" size={20} color="white" />
                  <Text className="font-medium text-white">New Project</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Filter and Search Section - Hidden in landscape */}
            <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
              <InputField
                placeholder="Search by client, reference or description"
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
          </View>
        )}

        {/* Table View - Always visible */}
        <View
          className={`flex-1 bg-white rounded-xl shadow-sm overflow-hidden ${
            isLandscape ? "" : "mb-10"
          }`}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <ProjectTableHeader isCompact={isCompactMode} />
              <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={fetchProjects}
                  />
                }
              >
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project, index) => (
                    <ProjectTableRow
                      key={project._id.toString()}
                      item={project}
                      index={index}
                      isCompact={isCompactMode}
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
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Projects;
