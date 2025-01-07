import React, { useState } from "react";
import {
  FlatList,
  View,
  TouchableOpacity,
  ScrollView,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Approvals = () => {
  const [heads, setHeads] = useState<Partial<Head>[]>([
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@company.com",
      phone: "123-456-7890",
      department: "IT",
      status: "Pending",
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob@company.com",
      phone: "234-567-8901",
      department: "HR",
      status: "Approved",
    },
  ]);

  const [filter, setFilter] = useState<
    "All" | "Pending" | "Approved" | "Rejected"
  >("All");

  const updateHeadStatus = (
    id: number,
    status: "Approved" | "Rejected" | "Pending"
  ) => {
    setHeads((prevHeads) =>
      prevHeads.map((head) => (head.id === id ? { ...head, status } : head))
    );
  };

  const filteredHeads = heads.filter(
    (head) => filter === "All" || head.status === filter
  );

  const HeadCard = ({ head }: { head: Partial<Head> }) => (
    <View className="border-l-4 border-primary p-6 bg-white rounded-2xl shadow-sm">
      <View className="flex-row justify-between mb-4">
        <View>
          <Text className="text-lg font-bold">{head.name}</Text>
          <Text className="text-gray-600">{head.phone}</Text>
          <Text className="text-gray-600">Department: {head.department}</Text>
        </View>
        <View
          className={`px-4 py-2 rounded-xl h-10 ${
            head.status === "Pending"
              ? "bg-yellow-100"
              : head.status === "Approved"
              ? "bg-green-100"
              : "bg-red-100"
          }`}
        >
          <Text
            className={
              head.status === "Pending"
                ? "text-yellow-600"
                : head.status === "Approved"
                ? "text-green-600"
                : "text-red-600"
            }
          >
            {head.status}
          </Text>
        </View>
      </View>
      <View className="flex-row gap-4">
        {head.status === "Pending" ? (
          <>
            <TouchableOpacity
              onPress={() =>
                head.id !== undefined && updateHeadStatus(head.id, "Approved")
              }
              className="flex-1 bg-green-500 rounded-xl p-4 items-center"
            >
              <Text className="text-white font-semibold">Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                head.id !== undefined && updateHeadStatus(head.id, "Rejected")
              }
              className="flex-1 bg-red-500 rounded-xl p-4 items-center"
            >
              <Text className="text-white font-semibold">Reject</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={() =>
              head.id !== undefined && updateHeadStatus(head.id, "Pending")
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
    <SafeAreaView className="flex-1">
      <FlatList
        ListHeaderComponent={
          <View>
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-2xl font-bold mb-1">Approvals</Text>
                <Text className="text-gray-600">
                  Manage department head approvals
                </Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6"
            >
              <View className="flex-row gap-2 p-1">
                {["All", "Pending", "Approved", "Rejected"].map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setFilter(status as any)}
                    className={`px-6 py-3 ${
                      filter === status ? "bg-primary" : "bg-white"
                    } rounded-xl shadow-sm`}
                  >
                    <Text
                      className={`${
                        filter === status
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
        keyExtractor={(item) => (item.id ?? "").toString()}
        contentContainerClassName="container my-6 gap-6"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Approvals;
