import { View, Text, ScrollView, Image, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput, Button, ActivityIndicator } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Dropdown } from "react-native-element-dropdown";
import { Link, router } from "expo-router";
import axios from "axios";
import { register } from "@/hooks/auth";

const SignUp = () => {
  const [isFocus, setIsFocus] = useState(false);
  const [heads, setHeads] = useState<Head[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
    department: "",
    head_id: "",
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

  const renderLabel2 = () => {
    if (formData.head_id || isFocus) {
      return (
        <Text
          className={
            `absolute bg-[#f6fcff] left-3 -translate-y-1/2 top-0 z-10 px-2 text-sm text-gray-700 ` +
            (isFocus ? "text-[#A82F39]" : "")
          }
        >
          Head
        </Text>
      );
    }
    return null;
  };

  const renderLabel3 = () => {
    if (formData.department || isFocus) {
      return (
        <Text
          className={
            `absolute bg-[#f6fcff] left-3 -translate-y-1/2 top-0 z-10 px-2 text-sm text-gray-700 ` +
            (isFocus ? "text-[#A82F39]" : "")
          }
        >
          Department
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
  const departments = [
    { label: "Accounts", value: "accounts" },
    { label: "Technical", value: "technical" },
    { label: "IT", value: "it" },
    { label: "Sales", value: "sales" },
    { label: "Store", value: "store" },
  ];

  const fetchHeads = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/head`
      );
      setHeads(response.data);
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchHeads();
  }, []);

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.role
    ) {
      Alert.alert("Error", "Please fill all the fields");
      return;
    }
    if (!formData.email.includes("@") || !formData.email.includes(".")) {
      Alert.alert("Error", "Invalid email");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Password does not match");
      return;
    }
    if (formData.role === "head" && !formData.department) {
      Alert.alert("Error", "Please fill all the fields");
      return;
    }
    if (formData.role === "user" && !formData.head_id) {
      Alert.alert("Error", "Please fill all the fields");
      return;
    }
    try {
      setLoading(true);
      const { message } = await register({
        ...formData,
        email: formData.email.toLowerCase(),
      });
      Alert.alert("Success", message);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "",
        department: "",
        head_id: "",
      });
      router.push("/sign-in");
    } catch (error: any) {
      if (error.response?.status === 422) {
        Alert.alert("Error", "Email already exists");
        return;
      }
      Alert.alert("Error", "Something went wrong");
      console.error(error);
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
                  setFormData({ ...formData, role: item.value });
                  setIsFocus(false);
                }}
              />
            </View>
            {formData.role === "head" && (
              <View className="w-full">
                {renderLabel3()}
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
                  data={departments}
                  labelField="label"
                  valueField="value"
                  placeholder={!isFocus ? "Department" : ""}
                  value={formData.department}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={(item) => {
                    setFormData({ ...formData, department: item.value });
                    setIsFocus(false);
                  }}
                />
              </View>
            )}
            {formData.role === "user" && (
              <View className="w-full">
                {renderLabel2()}
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
                  data={heads}
                  labelField="name"
                  valueField="id"
                  placeholder={!isFocus ? "Head" : ""}
                  value={formData.head_id}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={(item) => {
                    setFormData({ ...formData, head_id: item.id.toString() });
                    setIsFocus(false);
                  }}
                />
              </View>
            )}
            <TextInput
              label="Name"
              mode="outlined"
              style={{
                width: "100%",
                backgroundColor: "transparent",
              }}
              activeOutlineColor="#A82F39"
              theme={{
                roundness: 10,
              }}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
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
              label="Phone"
              mode="outlined"
              style={{
                width: "100%",
                backgroundColor: "transparent",
              }}
              activeOutlineColor="#A82F39"
              theme={{
                roundness: 10,
              }}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
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
            <TextInput
              label="Confirm Password"
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
              value={formData.confirmPassword}
              onChangeText={(text) =>
                setFormData({ ...formData, confirmPassword: text })
              }
            />
          </View>
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
              {loading ? <ActivityIndicator color="white" /> : "Sign Up"}
            </Text>
          </Button>
          <Link href="/sign-in" className="text-center text-xl font-light mt-4">
            <Text>Sign In</Text>
          </Link>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SignUp;
