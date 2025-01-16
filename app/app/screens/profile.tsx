import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import InputField from "@/components/inputField";
import useAuthStore from "@/store/authStore";
import { logout } from "@/hooks/auth";
import axios from "axios";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { user, role, setRole, setToken, setUser } = useAuthStore();
  const [adminInfo, setAdminInfo] = useState({
    name: user?.name,
    email: user?.email,
    phone: user?.phone,
  });

  const handleSave = async () => {
    if (!adminInfo.name || !adminInfo.email || !adminInfo.phone) {
      Alert.alert("Error", "All fields are required");
      return;
    }
    if (!adminInfo.email.includes("@") || !adminInfo.email.includes(".")) {
      Alert.alert("Error", "Invalid email address");
      return;
    }
    try {
      let response;
      if (role === "admin") {
        response = await axios.put(
          `${process.env.EXPO_PUBLIC_API_URL}/admin/${user?.id}`,
          adminInfo
        );
      } else if (role === "head") {
        response = await axios.put(
          `${process.env.EXPO_PUBLIC_API_URL}/head/${user?.id}`,
          adminInfo
        );
      } else {
        response = await axios.put(
          `${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}`,
          adminInfo
        );
      }
      setUser(response.data);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "An error occurred. Please try again later");
    } finally {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAdminInfo({
      name: user?.name,
      email: user?.email,
      phone: user?.phone,
    });
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setToken(null);
    setRole(null);
    Alert.alert("Success", "Logged out successfully");
    router.push("/sign-in");
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 container"
      >
        <View className="my-6">
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-white p-2 rounded-full shadow-sm mr-4"
            >
              <AntDesign name="arrowleft" size={24} color="#374151" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-gray-900">Profile</Text>
              <Text className="text-gray-600">
                Manage your profile information
              </Text>
            </View>
          </View>

          {/* Profile Image and Info */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-primary rounded-full justify-center items-center">
              <Text style={{ color: "white" }} className="text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="mt-4 text-xl font-bold text-gray-900">
              {user?.name}
            </Text>
            <Text className="text-gray-600">
              {role && role[0].toUpperCase() + role.slice(1)}
            </Text>
          </View>
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <InputField
              label="Name"
              value={adminInfo.name || ""}
              onChangeText={(text) =>
                setAdminInfo({ ...adminInfo, name: text })
              }
              icon="person"
              required
              readonly={!isEditing}
            />
            <InputField
              label="Email"
              value={adminInfo.email || ""}
              onChangeText={(text) =>
                setAdminInfo({ ...adminInfo, email: text })
              }
              icon="email"
              keyboardType="email-address"
              required
              readonly={!isEditing}
            />
            <InputField
              label="Phone"
              value={adminInfo.phone || ""}
              onChangeText={(text) =>
                setAdminInfo({ ...adminInfo, phone: text })
              }
              icon="phone"
              keyboardType="phone-pad"
              required
              readonly={!isEditing}
            />
            {/* Edit and Save Buttons */}
            <View className="flex-row gap-4 mt-6">
              {isEditing ? (
                <>
                  <TouchableOpacity
                    onPress={handleSave}
                    className="flex-1 bg-green-500 rounded-xl p-4 items-center"
                  >
                    <Text className="text-white font-semibold">
                      Save Changes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCancel}
                    className="flex-1 bg-gray-200 rounded-xl p-4 items-center"
                  >
                    <Text className="text-gray-800 font-semibold">Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  className="flex-1 bg-yellow-400 rounded-xl p-4 items-center"
                >
                  <Text className="text-black font-semibold">Edit Profile</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-primary rounded-2xl p-4 mt-4 flex-row justify-center items-center"
          >
            <MaterialIcons name="logout" size={24} color="white" />
            <Text className="text-lg font-semibold ml-2 text-white">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
