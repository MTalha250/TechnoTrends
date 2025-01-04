import { View, Text, Image } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Link } from "expo-router";

const LandingScreen = () => {
  return (
    <LinearGradient colors={["#fff", "#E9F8FF"]} style={{ flex: 1 }}>
      <SafeAreaView className="container flex-1">
        <View className="flex-1 justify-center gap-20">
          <Image
            source={require("../assets/images/logo.png")}
            className="w-full h-44"
            resizeMode="contain"
          />

          <View className="w-full gap-10">
            <Text className="text-3xl font-bold text-center text-gray-800">
              Manage Your Projects, Anytime, Anywhere
            </Text>
            <Text className="text-center font-pregular text-2xl text-gray-500">
              Easily create, assign, and track tasks to stay on top of deadlines
            </Text>
            <Link href="/sign-in" className="bg-primary rounded-full p-5">
              <View className="w-full flex-row items-center justify-center gap-2">
                <Text className="text-center text-xl font-light text-white">
                  Get Started
                </Text>
                <View className="animate-bounceX">
                  <AntDesign name="arrowright" size={24} color="white" />
                </View>
              </View>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LandingScreen;
