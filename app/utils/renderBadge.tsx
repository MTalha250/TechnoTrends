import { View, Text } from "react-native";
import React from "react";
import { isValueFilled } from "./isValueFilled";
import { MaterialIcons } from "@expo/vector-icons";

const RenderBadge = (label: string, value: any) => {
  const isFilled = isValueFilled(value);
  return (
    <View className="flex-row items-center mb-1 mr-2">
      <View
        className={`h-6 px-2 rounded-full flex-row items-center ${
          isFilled ? "bg-green-100" : "bg-red-100"
        }`}
      >
        <MaterialIcons
          name={isFilled ? "check-circle" : "cancel"}
          size={14}
          color={isFilled ? "#16a34a" : "#dc2626"}
        />
        <Text
          className={`ml-1 text-xs ${
            isFilled ? "text-green-700" : "text-red-700"
          }`}
        >
          {label}
        </Text>
      </View>
    </View>
  );
};

export default RenderBadge;
