import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import InputField from "@/components/inputField";

type Admin = {
  name: string;
  email: string;
  phone: string;
};

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [adminInfo, setAdminInfo] = useState<Admin>({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 8900",
  });
  const [tempInfo, setTempInfo] = useState<Admin>({ ...adminInfo });

  const handleSave = () => {
    setAdminInfo(tempInfo);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempInfo(adminInfo);
    setIsEditing(false);
  };

  const handleLogout = () => {
    console.log("Logging out...");
    // Add your logout logic here
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 container py-6"
      >
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
            <Text style={{ color: "white" }} className="text-2xl">
              MT
            </Text>
          </View>
          <Text className="mt-4 text-xl font-bold text-gray-900">
            {adminInfo.name}
          </Text>
          <Text className="text-gray-600">Admin</Text>
        </View>
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <InputField
            label="Name"
            value={adminInfo.name}
            onChangeText={(text) => setTempInfo({ ...tempInfo, name: text })}
            icon="person"
            required
            readonly={!isEditing}
          />
          <InputField
            label="Email"
            value={adminInfo.email}
            onChangeText={(text) => setTempInfo({ ...tempInfo, email: text })}
            icon="email"
            keyboardType="email-address"
            required
            readonly={!isEditing}
          />
          <InputField
            label="Phone"
            value={adminInfo.phone}
            onChangeText={(text) => setTempInfo({ ...tempInfo, phone: text })}
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
                  <Text className="text-white font-semibold">Save Changes</Text>
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
          <Text className="text-lg font-semibold ml-2 text-white">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
