import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput, Button, HelperText } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Dropdown } from "react-native-element-dropdown";
import { Link } from "expo-router";

const SignIn = () => {
  const [isFocus, setIsFocus] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [errors, setErrors] = useState({
    email: false,
    password: false,
    role: false,
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
    { label: "Admin", value: "admin" },
    { label: "Department Head", value: "head" },
    { label: "Worker", value: "user" },
  ];

  const handleSubmit = () => {
    const emailError = !formData.email.includes("@");
    const passwordError = formData.password.length < 6;
    const roleError = !formData.role;
    setErrors({
      email: emailError,
      password: passwordError,
      role: roleError,
    });

    if (!emailError && !passwordError) {
      console.log("Sign In", formData);
    }
  };

  return (
    <LinearGradient colors={["#fff", "#E9F8FF"]} style={{ flex: 1 }}>
      <SafeAreaView className="container flex-1">
        <View className="flex-1 justify-center items-center">
          <Image
            source={require("../../assets/images/logo.png")}
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
              {errors.role && (
                <HelperText type="error">Please select a role.</HelperText>
              )}
            </View>
            <View className="w-full">
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
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
              />
              {errors.email && (
                <HelperText type="error">
                  Please enter a valid email address.
                </HelperText>
              )}
            </View>
            <View className="w-full">
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
              {errors.password && (
                <HelperText type="error">
                  Password must be at least 6 characters long.
                </HelperText>
              )}
            </View>
          </View>
          <Button
            onPress={handleSubmit}
            buttonColor="#A82F39"
            style={{
              borderRadius: 100,
              marginTop: 32,
              width: "100%",
              padding: 10,
            }}
          >
            <Text className="text-center text-xl font-light text-white">
              Log In
            </Text>
          </Button>
          <Link
            href="/(auth)/sign-up"
            className="text-center text-xl font-light mt-4"
          >
            <Text>Register</Text>
          </Link>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SignIn;
