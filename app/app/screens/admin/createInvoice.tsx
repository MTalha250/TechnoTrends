import React, { useEffect, useState } from "react";
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
import InputField from "@/components/inputField";
import { Dropdown } from "react-native-element-dropdown";
import PhotosUploader from "@/components/uploader";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { ActivityIndicator } from "react-native-paper";

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/projects`
      );
      setProjects(response.data);
    } catch (error) {
      Alert.alert("Error", "An error occurred while fetching projects");
      return;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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

  const handleSubmit = async () => {
    if (
      !invoice.invoiceReference ||
      !invoice.invoiceImage ||
      !invoice.linkedProject ||
      !invoice.amount ||
      !invoice.paymentTerms ||
      !invoice.dueDate
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    if (invoice.paymentTerms === "Credit" && !invoice.creditDays) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/invoices`, {
        ...invoice,
        status: "Unpaid",
      });
      Alert.alert("Success", "Invoice created successfully");
      setInvoice({
        invoiceReference: "",
        invoiceImage: "",
        linkedProject: "",
        amount: "",
        paymentTerms: "Cash",
        creditDays: "",
        dueDate: null,
      });
      router.back();
    } catch (error) {
      Alert.alert("Error", "An error occurred while creating the invoice");
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 container">
        <View className="my-6">
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
              placeholder="Enter invoice reference"
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
                  style={{
                    flex: 1,
                    padding: 0,
                    backgroundColor: "transparent",
                  }}
                  placeholderStyle={{ color: "#9CA3AF" }}
                  data={projects}
                  labelField="title"
                  valueField="id"
                  placeholder="Select Project"
                  value={invoice.linkedProject}
                  onChange={(item) =>
                    handleChange("linkedProject", item.id.toString())
                  }
                />
              </View>
            </View>

            <InputField
              label="Amount"
              placeholder="Enter invoice amount"
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
                  style={{
                    flex: 1,
                    padding: 0,
                    backgroundColor: "transparent",
                  }}
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
                required
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
            disabled={loading}
            className={`bg-primary rounded-2xl p-4 justify-center items-center ${
              loading ? "opacity-50" : ""
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-lg font-semibold text-white">
                Create Invoice
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateInvoice;
