import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  Image,
  Modal as RNModal,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { Button } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";
import InputField from "@/components/inputField";
import DateTimePicker from "@react-native-community/datetimepicker";

const InvoiceDetail = () => {
  const { id } = useLocalSearchParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      handleFieldChange("dueDate", selectedDate.toISOString());
    }
  };

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Invoice>(
        `${process.env.EXPO_PUBLIC_API_URL}/invoices/${id}`
      );
      setInvoice(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch invoice details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleSaveChanges = async () => {
    if (
      !invoice?.invoiceReference ||
      !invoice?.amount ||
      !invoice?.paymentTerms ||
      !invoice?.dueDate
    ) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    try {
      setSaving(true);
      await axios.put(`${process.env.EXPO_PUBLIC_API_URL}/invoices/${id}`, {
        invoiceReference: invoice?.invoiceReference,
        amount: invoice?.amount,
        paymentTerms: invoice?.paymentTerms,
        creditDays: invoice?.creditDays,
        dueDate: invoice?.dueDate,
        poNumber: invoice?.poNumber,
        dcReference: invoice?.dcReference,
        jcReference: invoice?.jcReference,
      });
      Alert.alert("Success", "Invoice updated successfully");
      setEditMode(false);
      fetchInvoice();
    } catch (error) {
      Alert.alert("Error", "Failed to update invoice");
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setInvoice((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-200 text-green-800";
      case "unpaid":
        return "bg-yellow-200 text-yellow-800";
      case "in progress":
        return "bg-blue-200 text-blue-800";
      case "overdue":
        return "bg-red-200 text-red-800";
      case "cancelled":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const LinkedProjectSection = () => (
    <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
      <Text className="text-lg font-bold mb-4">Linked Project</Text>
      {invoice?.project ? (
        <TouchableOpacity
          onPress={() => router.push(`/screens/project/${invoice.project.id}`)}
          className="flex-row items-center justify-between"
        >
          <View>
            <Text className="font-semibold text-lg">
              {invoice.project.clientName}
            </Text>
            <Text className="text-gray-600">
              {invoice.project.description
                ? invoice.project.description
                : "No description"}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#374151" />
        </TouchableOpacity>
      ) : (
        <Text className="text-gray-600">No project linked to this invoice</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#A82F39" />
      </View>
    );
  }

  if (!invoice) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-600 text-center mb-4">
          {"Invoice not found"}
        </Text>
        <Button mode="contained" onPress={fetchInvoice}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 container my-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-white p-2 rounded-full shadow-sm mr-4"
            >
              <MaterialIcons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-gray-800">
                Invoice Details
              </Text>
              <Text className="text-gray-600">
                View details of the selected invoice
              </Text>
            </View>
          </View>
          <View
            className={`px-3 py-1 rounded-full ${getStatusColor(
              invoice.status
            )}`}
          >
            <Text className="font-medium">{invoice.status}</Text>
          </View>
        </View>

        {/* Edit/Save Button */}
        <TouchableOpacity
          onPress={() => {
            if (editMode) {
              handleSaveChanges();
            } else {
              setEditMode(true);
            }
          }}
          disabled={saving}
          className={`mb-4 p-3 rounded-xl ${
            editMode ? "bg-green-600" : "bg-primary"
          } ${saving ? "opacity-50" : ""}`}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold">
              {editMode ? "Save Changes" : "Edit Invoice"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Invoice Details Form */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <InputField
            label="Invoice Reference"
            value={invoice.invoiceReference || ""}
            icon="receipt"
            onChangeText={(value) =>
              handleFieldChange("invoiceReference", value)
            }
            readonly={!editMode}
            placeholder="Enter invoice reference"
          />
          <InputField
            label="Amount"
            value={invoice.amount || ""}
            icon="attach-money"
            onChangeText={(value) => handleFieldChange("amount", value)}
            readonly={!editMode}
            placeholder="Enter amount"
            keyboardType="numeric"
          />
          {editMode ? (
            <View className="mb-6">
              <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide mb-4">
                Payment Terms
              </Text>
              <Dropdown
                style={{
                  backgroundColor: "white",
                  borderRadius: 12,
                  borderColor: "#ddd",
                  borderWidth: 1,
                  padding: 14,
                }}
                placeholderStyle={{ color: "#6b7280" }}
                selectedTextStyle={{ color: "#374151" }}
                data={[
                  { label: "Cash", value: "Cash" },
                  { label: "Credit", value: "Credit" },
                ]}
                labelField="label"
                valueField="value"
                placeholder="Select Payment Terms"
                value={invoice.paymentTerms}
                onChange={(item) =>
                  handleFieldChange("paymentTerms", item.value)
                }
              />
            </View>
          ) : (
            <InputField
              label="Payment Terms"
              value={invoice.paymentTerms}
              icon="payment"
              readonly
            />
          )}
          {invoice.paymentTerms === "Credit" && (
            <InputField
              label="Credit Days"
              value={invoice.creditDays || ""}
              icon="schedule"
              onChangeText={(value) => handleFieldChange("creditDays", value)}
              readonly={!editMode}
              placeholder="Enter credit days"
              keyboardType="numeric"
            />
          )}
          {!editMode ? (
            <InputField
              label="Due Date"
              value={
                invoice.dueDate ? new Date(invoice.dueDate).toDateString() : ""
              }
              icon="event"
              readonly
              placeholder="Select due date"
            />
          ) : (
            <View className="mb-6">
              <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide mb-4">
                Due Date
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
                      ? new Date(invoice.dueDate).toLocaleDateString()
                      : "Select due date"}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {(showDatePicker || Platform.OS === "ios") && (
                <DateTimePicker
                  value={
                    invoice.dueDate ? new Date(invoice.dueDate) : new Date()
                  }
                  mode="date"
                  minimumDate={new Date()}
                  accentColor="#A82F39"
                  onChange={handleDateChange}
                />
              )}
            </View>
          )}
          <InputField
            label="PO Number"
            value={invoice.poNumber || ""}
            icon="receipt"
            onChangeText={(value) => handleFieldChange("poNumber", value)}
            readonly={!editMode}
            placeholder="Enter PO number"
          />
          <InputField
            label="DC Reference"
            value={invoice.dcReference || ""}
            icon="receipt"
            onChangeText={(value) => handleFieldChange("dcReference", value)}
            readonly={!editMode}
            placeholder="Enter DC reference"
          />
          <InputField
            label="JC Reference"
            value={invoice.jcReference || ""}
            icon="receipt"
            onChangeText={(value) => handleFieldChange("jcReference", value)}
            readonly={!editMode}
            placeholder="Enter JC reference"
          />
        </View>
        <LinkedProjectSection />
      </ScrollView>
    </SafeAreaView>
  );
};

export default InvoiceDetail;
