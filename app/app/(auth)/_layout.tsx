import { View, Text, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const AuthLayout = () => {
  return (
    <SafeAreaView className="flex-1 w-full">
      <View className="flex-1 justify-center items-center bg-primary">
        <Text>AuthLayout</Text>
      </View>
    </SafeAreaView>
  );
};

export default AuthLayout;
