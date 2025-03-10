import InputField from "@/components/inputField";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  Alert,
  RefreshControl,
} from "react-native";
import { Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const Approvals = () => {
  const [heads, setHeads] = useState<Head[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHeads = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get<Head[]>(
        `${process.env.EXPO_PUBLIC_API_URL}/head`
      );
      setHeads(response.data);
    } catch (error) {
      console.error("Error fetching heads:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHeads();
  }, []);

  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [searchText, setSearchText] = useState("");

  const updateHeadStatus = async (
    id: number,
    status: "approved" | "rejected" | "pending"
  ) => {
    setRefreshing(true);
    try {
      await axios.put(`${process.env.EXPO_PUBLIC_API_URL}/head/${id}`, {
        status,
      });

      setHeads((prevHeads) =>
        prevHeads.map((head) => (head.id === id ? { ...head, status } : head))
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update status. Please try again later.");
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredHeads = heads.filter((head) => {
    const matchesFilter =
      filter.toLowerCase() === "all" || head.status === filter.toLowerCase();
    const matchesSearch =
      head.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      head.phone?.toLowerCase().includes(searchText.toLowerCase()) ||
      head.department?.toLowerCase().includes(searchText.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const HeadCard = ({ head }: { head: Partial<Head> }) => (
    <View className="border-l-4 border-primary p-6 bg-white rounded-2xl shadow-sm mb-4">
      <View className="flex-row justify-between">
        <View className="gap-2">
          <Text className="text-xl font-bold">{head.name}</Text>
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="email" size={16} color="#A82F39" />
            <Text>{head.email}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="phone" size={16} color="#A82F39" />
            <Text>{head.phone}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="business" size={16} color="#A82F39" />
            <Text>{head.department}</Text>
          </View>
        </View>

        <View
          className={`px-4 py-2 rounded-xl h-10 ${
            head.status === "pending"
              ? "bg-yellow-100"
              : head.status === "approved"
              ? "bg-green-100"
              : "bg-red-100"
          }`}
        >
          <Text
            className={
              head.status === "pending"
                ? "text-yellow-600"
                : head.status === "approved"
                ? "text-green-600"
                : "text-red-600"
            }
          >
            {(head.status ?? "pending")[0].toUpperCase() +
              (head.status ?? "pending").slice(1)}
          </Text>
        </View>
      </View>

      <Divider className="my-4" />

      <View className="flex-row gap-4">
        {refreshing ? (
          <View className="flex-1 bg-gray-300 rounded-xl p-4 items-center">
            <Text className="text-gray-600 font-semibold">Loading...</Text>
          </View>
        ) : head.status === "pending" ? (
          <>
            <TouchableOpacity
              onPress={() =>
                head.id !== undefined && updateHeadStatus(head.id, "approved")
              }
              className="flex-1 bg-green-600 rounded-xl p-4 items-center"
            >
              <Text className="text-white font-semibold">Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                head.id !== undefined && updateHeadStatus(head.id, "rejected")
              }
              className="flex-1 bg-red-600 rounded-xl p-4 items-center"
            >
              <Text className="text-white font-semibold">Reject</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={() =>
              head.id !== undefined && updateHeadStatus(head.id, "pending")
            }
            className="flex-1 bg-yellow-500 rounded-xl p-4 items-center"
          >
            <Text className="text-black font-semibold">Undo</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        ListHeaderComponent={
          <View>
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-2xl font-bold">Approvals</Text>
                <Text className="text-gray-600">
                  Manage department head approvals
                </Text>
              </View>
            </View>

            <InputField
              placeholder="Search by name, phone, or department"
              value={searchText}
              onChangeText={setSearchText}
              icon="search"
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6"
            >
              <View className="flex-row gap-2 p-1">
                {["All", "Pending", "Approved", "Rejected"].map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setFilter(status.toLowerCase() as any)}
                    className={`px-6 py-3 ${
                      filter === status.toLowerCase()
                        ? "bg-primary"
                        : "bg-white"
                    } rounded-xl shadow-sm`}
                  >
                    <Text
                      className={`${
                        filter === status.toLowerCase()
                          ? "text-white font-medium"
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
        }
        data={filteredHeads}
        renderItem={({ item }) => <HeadCard head={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchHeads} />
        }
        keyExtractor={(item) => (item.id ?? "").toString()}
        contentContainerClassName="container my-6"
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500">
              {searchText || filter !== "all"
                ? "No department heads match your filters"
                : "No department heads found"}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Approvals;
