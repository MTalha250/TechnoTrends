import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Text,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import InputField from "../../../components/inputField";
import { Dropdown } from "react-native-element-dropdown";
import PhotosUploader from "../../../components/uploader";
import DateTimePicker from "@react-native-community/datetimepicker";

const projects = [
  { label: "Project A", value: "projectA" },
  { label: "Project B", value: "projectB" },
  { label: "Project C", value: "projectC" },
];

const paymentTerms = [
  { label: "Cash", value: "Cash" },
  { label: "Credit", value: "Credit" },
];

interface Invoice {
  invoiceReference: string;
  invoiceImage: string;
  linkedProject: string;
  amount: string;
  paymentTerms: string;
  creditDays: string;
  dueDate: Date | null;
}

const CreateInvoice = () => {
  const [invoice, setInvoice] = useState<Invoice>({
    invoiceReference: "",
    invoiceImage: "",
    linkedProject: "",
    amount: "",
    paymentTerms: "Cash",
    creditDays: "",
    dueDate: null,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      handleChange("dueDate", selectedDate);
    }
  };

  const handleChange = (field: keyof Invoice, value: string | Date | null) => {
    setInvoice((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (
      !invoice.invoiceReference ||
      !invoice.linkedProject ||
      !invoice.amount ||
      !invoice.dueDate
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    console.log("Creating invoice:", invoice);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 container my-6">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-white p-2 rounded-full shadow-sm mr-4"
          >
            <MaterialIcons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold">Create Invoice</Text>
            <Text className="text-gray-600">
              Add a new invoice to your list
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <InputField
            label="Invoice Reference"
            value={invoice.invoiceReference || ""}
            onChangeText={(text) => handleChange("invoiceReference", text)}
            icon="description"
            required
          />

          <View className="mb-6">
            <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide">
              Invoice Image <Text className="text-red-500">*</Text>
            </Text>
            <PhotosUploader
              addedPhotos={invoice.invoiceImage ? [invoice.invoiceImage] : []}
              onChange={(photos) =>
                setInvoice((prev) => ({ ...prev, invoiceImage: photos[0] }))
              }
              maxPhotos={1}
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide mb-2">
              Select Project <Text className="text-red-500">*</Text>
            </Text>
            <View className="flex-row items-center bg-white rounded-xl border border-gray-200 p-4">
              <MaterialIcons
                name="folder-open"
                size={24}
                color="#6B7280"
                style={{ marginRight: 10 }}
              />
              <Dropdown
                style={{ flex: 1, padding: 0, backgroundColor: "transparent" }}
                placeholderStyle={{ color: "#9CA3AF" }}
                data={projects}
                labelField="label"
                valueField="value"
                placeholder="Select Project"
                value={invoice.linkedProject || ""}
                onChange={(item) => handleChange("linkedProject", item.value)}
              />
            </View>
          </View>

          <InputField
            label="Amount"
            value={invoice.amount || ""}
            onChangeText={(text) => handleChange("amount", text)}
            icon="attach-money"
            keyboardType="numeric"
            required
          />

          <View className="mb-6">
            <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide mb-2">
              Payment Terms <Text className="text-red-500">*</Text>
            </Text>
            <View className="flex-row items-center bg-white rounded-xl border border-gray-200 p-4">
              <MaterialIcons
                name="credit-card"
                size={24}
                color="#6B7280"
                style={{ marginRight: 10 }}
              />
              <Dropdown
                style={{ flex: 1, padding: 0, backgroundColor: "transparent" }}
                placeholderStyle={{ color: "#9CA3AF" }}
                data={paymentTerms}
                labelField="label"
                valueField="value"
                placeholder="Select Payment Terms"
                value={invoice.paymentTerms}
                onChange={(item) => handleChange("paymentTerms", item.value)}
              />
            </View>
          </View>

          {invoice.paymentTerms === "Credit" && (
            <InputField
              label="Credit Days"
              value={invoice.creditDays || ""}
              onChangeText={(text) => handleChange("creditDays", text)}
              icon="event"
              keyboardType="numeric"
            />
          )}

          <View className="mb-6">
            <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide mb-4">
              Due Date <Text className="text-red-500">*</Text>
            </Text>
            {Platform.OS === "android" ? (
              <TouchableOpacity
                onPress={showDatePickerModal}
                className="flex-row items-center bg-white rounded-xl border border-gray-200 p-4"
              >
                <MaterialIcons
                  name="event"
                  size={24}
                  color="#6B7280"
                  style={{ marginRight: 10 }}
                />
                <Text className="text-black">
                  {invoice.dueDate
                    ? invoice.dueDate.toLocaleDateString()
                    : "Select due date"}
                </Text>
              </TouchableOpacity>
            ) : null}

            {(showDatePicker || Platform.OS === "ios") && (
              <DateTimePicker
                value={invoice.dueDate || new Date()}
                mode="date"
                minimumDate={new Date()}
                accentColor="#A82F39"
                onChange={handleDateChange}
              />
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-primary rounded-2xl p-4 justify-center items-center"
        >
          <Text className="text-lg font-semibold text-white">
            Create Invoice
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateInvoice;
