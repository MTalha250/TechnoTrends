import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";

interface Props {
  title: string;
  value: number;
  icon: string;
}

const StatCard = ({ title, value, icon }: Props) => {
  return (
    <View className="bg-white p-6 rounded-2xl justify-center items-center gap-3 shadow-sm">
      <MaterialIcons name={icon as any} size={24} color="#A82F39" />
      <Text>{title}</Text>
      <Text className="text-3xl font-semibold">{value}</Text>
    </View>
  );
};

export default StatCard;
