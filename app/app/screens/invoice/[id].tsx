import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
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
import useAuthStore from "@/store/authStore";

const InvoiceDetail = () => {
  const { id } = useLocalSearchParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editProject, setEditProject] = useState(false);
  const [projectSaving, setProjectSaving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [jcReference, setJcReference] = useState("");
  const [dcReference, setDcReference] = useState("");
  const { token, role } = useAuthStore();

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
        `${process.env.EXPO_PUBLIC_API_URL}/invoices/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
      await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/invoices/${id}`,
        {
          invoiceReference: invoice?.invoiceReference,
          amount: invoice?.amount,
          paymentTerms: invoice?.paymentTerms,
          creditDays: invoice?.creditDays,
          dueDate: invoice?.dueDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert("Success", "Invoice updated successfully");
      setEditMode(false);
      fetchInvoice();
    } catch (error) {
      Alert.alert("Error", "Failed to update invoice");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProjectChanges = async () => {
    if (!invoice?.project?._id) {
      Alert.alert("Error", "No project linked to this invoice");
      return;
    }
    try {
      setProjectSaving(true);
      await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/projects/${invoice.project._id}`,
        {
          po: invoice.project.po,
          jcReferences: invoice.project.jcReferences,
          dcReferences: invoice.project.dcReferences,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert("Success", "Project updated successfully");
      setEditProject(false);
      fetchInvoice();
    } catch (error) {
      Alert.alert("Error", "Failed to update project");
    } finally {
      setProjectSaving(false);
    }
  };

  const handleDeleteInvoice = async () => {
    Alert.alert(
      "Delete Invoice",
      "Are you sure you want to delete this invoice? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setSaving(true);
              await axios.delete(
                `${process.env.EXPO_PUBLIC_API_URL}/invoices/${id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              Alert.alert("Success", "Invoice deleted successfully");
              router.back();
            } catch (error) {
              console.log("Error deleting invoice", error);
              Alert.alert("Error", "Failed to delete invoice");
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
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
      case "pending":
        return "bg-yellow-200 text-yellow-800";
      case "completed":
        return "bg-green-200 text-green-800";
      case "in progress":
        return "bg-blue-200 text-blue-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const LinkedProjectSection = () => (
    <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
      <Text className="text-lg font-bold mb-4">Linked Project</Text>
      {invoice?.project ? (
        <TouchableOpacity
          onPress={() => router.push(`/screens/project/${invoice.project._id}`)}
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
        <View className="flex-row gap-2 justify-center mb-4">
          <TouchableOpacity
            onPress={() => {
              if (editMode) {
                handleSaveChanges();
              } else {
                setEditMode(true);
              }
            }}
            disabled={saving}
            className={`p-3 rounded-xl ${
              editMode ? "bg-green-600 w-full" : "bg-primary w-[48%]"
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

          {/* Delete Button - Only for Admin+ */}
          {(role === "admin" || role === "director") && !editMode && (
            <TouchableOpacity
              onPress={handleDeleteInvoice}
              disabled={saving}
              className={`w-[48%] p-3 rounded-xl bg-red-600 ${
                saving ? "opacity-50" : ""
              }`}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-semibold">
                  Delete Invoice
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

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
        </View>
        <TouchableOpacity
          onPress={() => {
            if (editProject) {
              handleSaveProjectChanges();
            } else {
              setEditProject(true);
            }
          }}
          disabled={projectSaving}
          className={`mb-4 p-3 rounded-xl ${
            editProject ? "bg-green-600" : "bg-primary"
          } ${projectSaving ? "opacity-50" : ""}`}
        >
          {projectSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold">
              {editProject ? "Save Changes" : "Edit Project Details"}
            </Text>
          )}
        </TouchableOpacity>
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <InputField
            label="PO Number"
            value={invoice.project?.po?.value || ""}
            icon="receipt"
            onChangeText={(value) =>
              setInvoice((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  project: {
                    ...prev.project,
                    po: { ...prev.project.po, value },
                  },
                };
              })
            }
            readonly={!editProject}
            placeholder="Enter  PO number"
          />
          {editProject ? (
            <View>
              <View className="flex-row items-center">
                <InputField
                  label="JC Reference"
                  placeholder="Enter JC reference"
                  value={jcReference || ""}
                  onChangeText={(text) => setJcReference(text)}
                  icon="receipt"
                />
                <TouchableOpacity
                  onPress={() => {
                    if (jcReference) {
                      setInvoice((prev: any) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          project: {
                            ...prev.project,
                            jcReferences: [
                              ...(prev.project.jcReferences || []),
                              {
                                value: jcReference,
                                isEdited: false,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                              },
                            ],
                          },
                        };
                      });
                      setJcReference("");
                    } else {
                      Alert.alert("Error", "Please enter a JC reference");
                    }
                  }}
                  className="bg-primary rounded-full p-2 ml-4"
                >
                  <MaterialIcons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>
              {invoice.project.jcReferences?.length > 0 && (
                <View className="flex-row flex-wrap mb-6">
                  {invoice.project.jcReferences?.map((jc, index) => (
                    <View
                      key={index}
                      className="bg-gray-100 rounded-full p-2 mr-2 mb-2 flex-row items-center"
                    >
                      <Text>{jc.value}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          setInvoice((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              project: {
                                ...prev.project,
                                jcReferences: prev.project.jcReferences?.filter(
                                  (_: any, i: number) => i !== index
                                ),
                              },
                            };
                          })
                        }
                        className="ml-2"
                      >
                        <MaterialIcons name="close" size={20} color="#A82F39" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View className="mb-6">
              <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide mb-4">
                JC References
              </Text>
              <View className="flex-row flex-wrap">
                {invoice.project.jcReferences?.map((jc, index) => (
                  <View
                    key={index}
                    className="bg-gray-100 rounded-full p-2 mr-2 mb-2"
                  >
                    <Text>
                      {jc.value}{" "}
                      {jc.updatedAt
                        ? ` (${new Date(jc.updatedAt).toDateString()})`
                        : ""}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {editProject ? (
            <View>
              <View className="flex-row items-center">
                <InputField
                  label="DC Reference"
                  placeholder="Enter DC reference"
                  value={dcReference || ""}
                  onChangeText={(text) => setDcReference(text)}
                  icon="receipt"
                />
                <TouchableOpacity
                  onPress={() => {
                    if (dcReference) {
                      setInvoice((prev: any) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          project: {
                            ...prev.project,
                            dcReferences: [
                              ...(prev.project.dcReferences || []),
                              {
                                value: dcReference,
                                isEdited: false,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                              },
                            ],
                          },
                        };
                      });
                      setDcReference("");
                    } else {
                      Alert.alert("Error", "Please enter a DC reference");
                    }
                  }}
                  className="bg-primary rounded-full p-2 ml-4"
                >
                  <MaterialIcons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>
              {invoice.project.dcReferences?.length > 0 && (
                <View className="flex-row flex-wrap mb-6">
                  {invoice.project.dcReferences?.map((dc, index) => (
                    <View
                      key={index}
                      className="bg-gray-100 rounded-full p-2 mr-2 mb-2 flex-row items-center"
                    >
                      <Text>{dc.value}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          setInvoice((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              project: {
                                ...prev.project,
                                dcReferences: prev.project.dcReferences?.filter(
                                  (_: any, i: number) => i !== index
                                ),
                              },
                            };
                          })
                        }
                        className="ml-2"
                      >
                        <MaterialIcons name="close" size={20} color="#A82F39" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View className="mb-6">
              <Text className="text-gray-600 font-medium text-sm uppercase tracking-wide mb-4">
                DC References
              </Text>
              <View className="flex-row flex-wrap">
                {invoice.project.dcReferences?.map((dc, index) => (
                  <View
                    key={index}
                    className="bg-gray-100 rounded-full p-2 mr-2 mb-2"
                  >
                    <Text>
                      {dc.value}{" "}
                      {dc.updatedAt
                        ? ` (${new Date(dc.updatedAt).toDateString()})`
                        : ""}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
        <LinkedProjectSection />
      </ScrollView>
    </SafeAreaView>
  );
};

export default InvoiceDetail;
