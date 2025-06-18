import { View, Text, TouchableOpacity } from "react-native";
import { Divider } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";

const ProjectCard = ({ item }: { item: Partial<Project> }) => {
  return (
    <View
      className="p-6 bg-white rounded-2xl shadow-sm mb-2"
      style={{ borderLeftWidth: 5, borderLeftColor: "#A82F39" }}
    >
      <View className="flex-row justify-between items-start">
        <Text className="text-xl font-bold">{item.clientName}</Text>
        <View
          className={`px-4 py-2 rounded-lg ${
            item.status === "Pending"
              ? "bg-yellow-100"
              : item.status === "In Progress"
              ? "bg-blue-100"
              : item.status === "Completed"
              ? "bg-green-100"
              : "bg-red-100"
          }`}
        >
          <Text
            className={
              item.status === "Pending"
                ? "text-yellow-700"
                : item.status === "In Progress"
                ? "text-blue-700"
                : item.status === "Completed"
                ? "text-green-700"
                : "text-red-700"
            }
          >
            {item.status}
          </Text>
        </View>
      </View>
      <Text className="mb-2 mt-2">
        {item.description ? item.description : "No description"}
      </Text>
      <Divider />
      <View className="flex-row justify-between items-center mt-4">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="calendar-today" size={20} color="#4b5563" />
          <Text>
            {item.dueDate
              ? new Date(item.dueDate).toDateString()
              : "No due date"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push(`/screens/project/${item._id}`)}
          className="flex-row items-center gap-2 px-4 py-2 rounded-lg bg-primary"
        >
          <Text className="text-white">Details</Text>
          <MaterialIcons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProjectCard;
