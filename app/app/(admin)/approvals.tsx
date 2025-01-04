import React, { useState } from "react";
import {
  SafeAreaView,
  FlatList,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Text, Card, Button } from "react-native-paper";

interface User {
  id: string;
  name: string;
  role: "Admin" | "Head" | "Worker";
  status: "Pending" | "Approved" | "Rejected";
}

const Approvals = () => {
  const [users, setUsers] = useState<User[]>([
    { id: "1", name: "Alice Johnson", role: "Admin", status: "Pending" },
    { id: "2", name: "Bob Smith", role: "Head", status: "Approved" },
    { id: "3", name: "Charlie Davis", role: "Worker", status: "Pending" },
  ]);

  const [filter, setFilter] = useState<
    "All" | "Pending" | "Approved" | "Rejected"
  >("All");

  const updateUserStatus = (
    id: string,
    status: "Approved" | "Rejected" | "Pending"
  ) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === id ? { ...user, status } : user))
    );
  };

  const filteredUsers = users.filter(
    (user) => filter === "All" || user.status === filter
  );

  const UserCard = ({ user }: { user: User }) => (
    <Card className="border-l-4 border-primary">
      <Card.Content className="p-6 bg-white rounded-2xl">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-lg font-bold">{user.name}</Text>
            <Text className="text-gray-600">{user.role}</Text>
          </View>
          <View
            className={`px-4 py-2 rounded-xl ${
              user.status === "Pending"
                ? "bg-yellow-100"
                : user.status === "Approved"
                ? "bg-green-100"
                : "bg-red-100"
            }`}
          >
            <Text
              className={
                user.status === "Pending"
                  ? "text-yellow-600"
                  : user.status === "Approved"
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {user.status}
            </Text>
          </View>
        </View>
        <View className="flex-row gap-4">
          {user.status === "Pending" ? (
            <>
              <Button
                mode="contained"
                onPress={() => updateUserStatus(user.id, "Approved")}
                buttonColor="#34d399"
                textColor="white"
              >
                Approve
              </Button>
              <Button
                mode="contained"
                onPress={() => updateUserStatus(user.id, "Rejected")}
                buttonColor="#f87171"
                textColor="white"
              >
                Reject
              </Button>
            </>
          ) : (
            <Button
              mode="contained"
              onPress={() => updateUserStatus(user.id, "Pending")}
              buttonColor="#fde047"
              textColor="black"
            >
              Undo
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1">
      <FlatList
        ListHeaderComponent={
          <View>
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-2xl mb-1">User Management</Text>
                <Text className="text-gray-600">
                  {filteredUsers.length} users
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
                      filter === status ? "bg-primary/10" : "bg-white"
                    } rounded-xl shadow-sm`}
                  >
                    <Text
                      className={`${
                        filter === status
                          ? "text-primary font-medium"
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
        data={filteredUsers}
        renderItem={({ item }) => <UserCard user={item} />}
        keyExtractor={(item) => item.id}
        contentContainerClassName="container my-6 gap-6"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Approvals;
