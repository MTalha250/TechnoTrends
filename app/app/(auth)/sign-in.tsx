import { View, Text, Image, Alert, ScrollView } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput, Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Dropdown } from "react-native-element-dropdown";
import { Link, router } from "expo-router";
import { login } from "@/hooks/auth";
import useAuthStore from "@/store/authStore";
import { ActivityIndicator } from "react-native-paper";

const SignIn = () => {
  const [isFocus, setIsFocus] = useState(false);
  const { setToken, setRole, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
    role: "user" as const,
  });

  const renderLabel = () => {
    if (formData.role || isFocus) {
      return (
        <Text
          className={
            `absolute bg-[#f6fcff] left-3 -translate-y-1/2 top-0 z-10 px-2 text-sm text-gray-700 ` +
            (isFocus ? "text-[#A82F39]" : "")
          }
        >
          Role
        </Text>
      );
    }
    return null;
  };

  const roles = [
    { label: "Director", value: "director" },
    { label: "Admin", value: "admin" },
    { label: "Head", value: "head" },
    { label: "Worker", value: "user" },
  ];

  const handleSubmit = async () => {
    if (!formData.email || !formData.password || !formData.role) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    try {
      setLoading(true);
      const data = await login(
        formData.email,
        formData.password,
        formData.role
      );
      setToken(data.token);
      setRole(data.role);
      setUser(data.user);
      if (data.role === "user") router.push("/userDashboard");
      else router.push("/dashboard");
      Alert.alert("Success", data.message);
    } catch (error: any) {
      if (error.response.status === 404) {
        Alert.alert("Error", "User not found");
        return;
      }
      if (error.response.status === 400) {
        Alert.alert("Error", "Invalid credentials or you are not authorized");
        return;
      }
      Alert.alert("Error", "Something went wrong");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#fff", "#E9F8FF"]} style={{ flex: 1 }}>
      <SafeAreaView className="container flex-1">
        <ScrollView contentContainerClassName="flex-1 justify-center">
          <Image
            source={require("@/assets/images/logo.png")}
            className="w-full h-44"
            resizeMode="contain"
          />
          <View className="w-full gap-3">
            <View className="w-full">
              {renderLabel()}
              <Dropdown
                style={[
                  {
                    width: "100%",
                    backgroundColor: "transparent",
                    borderColor: "#87858e",
                    borderRadius: 10,
                    padding: 14,
                    borderWidth: 1,
                  },
                  isFocus && { borderColor: "#A82F39" },
                ]}
                data={roles}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? "Role" : ""}
                value={formData.role}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={(item) => {
                  setFormData({ ...formData, role: item.value as any });
                  setIsFocus(false);
                }}
              />
            </View>
            <TextInput
              label="Email"
              mode="outlined"
              style={{
                width: "100%",
                backgroundColor: "transparent",
              }}
              activeOutlineColor="#A82F39"
              theme={{
                roundness: 10,
              }}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />
            <TextInput
              label="Password"
              mode="outlined"
              secureTextEntry
              style={{
                width: "100%",
                backgroundColor: "transparent",
              }}
              activeOutlineColor="#A82F39"
              theme={{
                roundness: 10,
              }}
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
            />
          </View>
          <Link
            href="/forgot-password"
            className="text-lg font-light mt-4 px-2"
          >
            <Text className="text-gray-600">Forgot Password?</Text>
          </Link>
          <Button
            onPress={handleSubmit}
            disabled={loading}
            style={{
              borderRadius: 100,
              marginTop: 32,
              width: "100%",
              padding: 10,
              backgroundColor: loading ? "#A82F39" : "#A82F39",
              opacity: loading ? 0.7 : 1,
            }}
            contentStyle={{
              backgroundColor: "#A82F39",
            }}
          >
            <Text className="text-center text-xl font-light text-white">
              {loading ? <ActivityIndicator color="white" /> : "Sign In"}
            </Text>
          </Button>
          <Link href="/sign-up" className="text-center text-xl font-light mt-4">
            <Text>Sign Up</Text>
          </Link>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SignIn;
