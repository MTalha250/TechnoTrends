import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
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
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { user, role, setRole, setToken, setUser, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [adminInfo, setAdminInfo] = useState({
    name: user?.name,
    email: user?.email,
    phone: user?.phone,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
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
      setLoading(true);
      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/users/profile`,
        adminInfo,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(response.data.user);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      if (error.response.status === 400) {
        Alert.alert("Error", "Email already in use");
        return;
      }
      Alert.alert("Error", "An error occurred. Please try again later");
    } finally {
      setIsEditing(false);
      setLoading(false);
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

  const handlePasswordChange = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      Alert.alert("Error", "All password fields are required");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long");
      return;
    }
    try {
      setPasswordLoading(true);
      await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/users/reset-password`,
        {
          oldPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert("Success", "Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
    } catch (error: any) {
      if (error.response?.status === 400) {
        Alert.alert("Error", "Current password is incorrect");
        return;
      }
      Alert.alert("Error", "An error occurred. Please try again later");
      console.log(error);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordCancel = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleLogout = async () => {
    setLoading(true);
    logout();
    setUser(null);
    setToken(null);
    setRole(null);
    Alert.alert("Success", "Logged out successfully");
    router.push("/sign-in");
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
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
                    disabled={loading}
                    className={`flex-1 bg-green-500 rounded-xl p-4 items-center ${
                      loading ? "opacity-50" : ""
                    }`}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-semibold">
                        Save Changes
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCancel}
                    disabled={loading}
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

          {/* Password Change Section */}
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-900">
                Change Password
              </Text>
              {!isChangingPassword && (
                <TouchableOpacity
                  onPress={() => setIsChangingPassword(true)}
                  className="bg-orange-500 px-4 py-2 rounded-xl"
                >
                  <Text className="text-white font-semibold">Change</Text>
                </TouchableOpacity>
              )}
            </View>

            {isChangingPassword ? (
              <View>
                <InputField
                  label="Current Password"
                  value={passwordData.currentPassword}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, currentPassword: text })
                  }
                  icon="lock"
                  keyboardType="default"
                  placeholder="Enter current password"
                  required
                />
                <InputField
                  label="New Password"
                  value={passwordData.newPassword}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, newPassword: text })
                  }
                  icon="lock-open"
                  keyboardType="default"
                  placeholder="Enter new password"
                  required
                />
                <InputField
                  label="Confirm New Password"
                  value={passwordData.confirmPassword}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, confirmPassword: text })
                  }
                  icon="lock-outline"
                  keyboardType="default"
                  placeholder="Confirm new password"
                  required
                />

                {/* Password Change Buttons */}
                <View className="flex-row gap-4 mt-6">
                  <TouchableOpacity
                    onPress={handlePasswordChange}
                    disabled={passwordLoading}
                    className={`flex-1 bg-green-500 rounded-xl p-4 items-center ${
                      passwordLoading ? "opacity-50" : ""
                    }`}
                  >
                    {passwordLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-semibold">
                        Update Password
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handlePasswordCancel}
                    disabled={passwordLoading}
                    className="flex-1 bg-gray-200 rounded-xl p-4 items-center"
                  >
                    <Text className="text-gray-800 font-semibold">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text className="text-gray-600">
                Click "Change" to update your password securely
              </Text>
            )}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            disabled={loading}
            className="bg-primary rounded-2xl p-4 mt-4 flex-row justify-center items-center"
          >
            <MaterialIcons name="logout" size={24} color="white" />
            <Text className="text-lg font-semibold ml-2 text-white">
              {loading ? <ActivityIndicator color="white" /> : "Logout"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
