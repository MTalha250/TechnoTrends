// components/InputField.tsx
import React from "react";
import { View, TextInput, Text, KeyboardTypeOptions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: keyof typeof MaterialIcons.glyphMap;
  keyboardType?: KeyboardTypeOptions;
  required?: boolean;
  placeholder?: string;
  readonly?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  icon,
  keyboardType = "default",
  required = false,
  placeholder,
  readonly = false,
}) => (
  <View className="mb-6">
    <Text className="text-gray-600 font-medium mb-2 text-sm uppercase tracking-wide">
      {label} {required && <Text className="text-primary">*</Text>}
    </Text>
    <View
      className="flex-row items-center bg-white rounded-xl"
      style={{ borderWidth: 1, borderColor: "#D1D5DB" }}
    >
      <MaterialIcons
        name={icon}
        size={24}
        color="#6B7280"
        style={{ marginLeft: 16 }}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        className="flex-1 p-4 text-black"
        keyboardType={keyboardType}
        placeholderTextColor="#9CA3AF"
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        readOnly={readonly}
      />
    </View>
  </View>
);

export default InputField;
