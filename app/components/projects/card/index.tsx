import { View, Text, TouchableOpacity } from "react-native";
import { Divider } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import RenderBadge from "@/utils/renderBadge";

const ProjectCard = ({ item }: { item: Partial<Project> }) => {
  return (
    <View className="border-l-4 border-primary p-6 bg-white rounded-2xl shadow-sm mb-4">
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text className="text-xl font-bold mb-2">{item.title}</Text>
          <Text>{item.description}</Text>
        </View>
        <View
          className={`px-4 py-2 h-10 rounded-lg ${
            item.status === "Pending"
              ? "bg-yellow-100"
              : item.status === "In Progress"
              ? "bg-blue-100"
              : item.status === "Completed"
              ? "bg-green-100"
              : item.status === "On Hold"
              ? "bg-orange-100"
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
                : item.status === "On Hold"
                ? "text-orange-700"
                : "text-red-700"
            }
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2 mb-4">
        <MaterialIcons name="business" size={16} color="#A82F39" />
        <Text>{item.clientName}</Text>
      </View>

      <View
        style={{
          flexWrap: "wrap",
        }}
        className="flex-row gap-2"
      >
        {RenderBadge("PO#", item.poNumber)}
        {RenderBadge("PO Image", item.poImage)}
        {RenderBadge("Client Contact", item.clientPhone)}
        {RenderBadge("Survey Photos", item.surveyPhotos)}
        {RenderBadge("Quotation#", item.quotationReference)}
        {RenderBadge("Quotation Image", item.quotationImage)}
        {RenderBadge("JC#", item.jcReference)}
        {RenderBadge("JC Image", item.jcImage)}
        {RenderBadge("DC#", item.dcReference)}
        {RenderBadge("DC Image", item.dcImage)}
        {RenderBadge("Remarks", item.remarks)}
      </View>

      <Divider className="my-4" />

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="calendar-today" size={20} color="#4b5563" />
          <Text>
            {item.dueDate
              ? new Date(item.dueDate).toDateString()
              : "No due date"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push(`/screens/admin/project/${item.id}`)}
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
