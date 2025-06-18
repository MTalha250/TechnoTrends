import { View, Text, Image, Alert, ScrollView } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput, Button, ActivityIndicator } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import axios from "axios";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "code" | "success">("email");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer countdown
  useEffect(() => {
    if (step === "code" && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [step, timeLeft]);

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/users/forgot-password`,
        {
          email: email.toLowerCase().trim(),
        }
      );

      Alert.alert("Success", response.data.message);
      setStep("code");
      setTimeLeft(60);
      setCanResend(false);
    } catch (error: any) {
      if (error.response?.status === 404) {
        Alert.alert("Error", "No account found with this email address");
        return;
      }
      if (error.response?.status === 400) {
        Alert.alert("Error", error.response.data.message || "Invalid request");
        return;
      }
      Alert.alert("Error", "Something went wrong. Please try again later.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }

    if (!newPassword) {
      Alert.alert("Error", "Please enter a new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/users/verify-reset-code`,
        {
          email: email.toLowerCase().trim(),
          code: verificationCode,
          newPassword,
        }
      );

      Alert.alert("Success", response.data.message);
      setStep("success");
    } catch (error: any) {
      if (error.response?.status === 400) {
        Alert.alert("Error", error.response.data.message || "Invalid code");
        return;
      }
      if (error.response?.status === 404) {
        Alert.alert("Error", "User not found");
        return;
      }
      Alert.alert("Error", "Something went wrong. Please try again later.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    setCanResend(false);
    setTimeLeft(60);
    handleSendCode();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Success Screen
  if (step === "success") {
    return (
      <LinearGradient colors={["#fff", "#E9F8FF"]} style={{ flex: 1 }}>
        <SafeAreaView className="container flex-1">
          <ScrollView contentContainerClassName="flex-1 justify-center">
            <Image
              source={require("@/assets/images/logo.png")}
              className="w-full h-44"
              resizeMode="contain"
            />

            <View className="w-full gap-6 items-center">
              <View className="bg-green-100 p-4 rounded-full">
                <Text className="text-green-600 text-4xl">✓</Text>
              </View>

              <View className="items-center">
                <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
                  Password Reset Successful!
                </Text>
                <Text className="text-gray-600 text-center leading-6">
                  Your password has been successfully updated.{"\n"}
                  You can now sign in with your new password.
                </Text>
              </View>

              <Button
                onPress={() => router.push("/sign-in")}
                mode="contained"
                style={{
                  borderRadius: 25,
                  width: "100%",
                  padding: 10,
                  backgroundColor: "#A82F39",
                }}
              >
                <Text className="text-white text-lg">Go to Sign In</Text>
              </Button>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Code Verification Screen
  if (step === "code") {
    return (
      <LinearGradient colors={["#fff", "#E9F8FF"]} style={{ flex: 1 }}>
        <SafeAreaView className="container flex-1">
          <ScrollView contentContainerClassName="flex-1 justify-center">
            <Image
              source={require("@/assets/images/logo.png")}
              className="w-full h-44"
              resizeMode="contain"
            />

            <View className="w-full gap-6">
              <View className="items-center mb-4">
                <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
                  Enter Verification Code
                </Text>
                <Text className="text-gray-600 text-center leading-6">
                  We've sent a 6-digit code to{"\n"}
                  <Text className="font-medium">{email}</Text>
                </Text>
              </View>

              <TextInput
                label="Verification Code"
                mode="outlined"
                style={{
                  width: "100%",
                  backgroundColor: "transparent",
                }}
                activeOutlineColor="#A82F39"
                theme={{
                  roundness: 10,
                }}
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code"
              />

              <TextInput
                label="New Password"
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
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
              />

              <TextInput
                label="Confirm New Password"
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
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
              />

              {/* Timer and Resend */}
              <View className="items-center">
                {timeLeft > 0 ? (
                  <Text className="text-gray-600 text-center">
                    Code expires in{" "}
                    <Text className="font-bold text-red-600">
                      {formatTime(timeLeft)}
                    </Text>
                  </Text>
                ) : (
                  <View className="items-center">
                    <Text className="text-red-600 text-center mb-2">
                      Code has expired
                    </Text>
                    <Button
                      onPress={handleResendCode}
                      disabled={loading || !canResend}
                      mode="text"
                      textColor="#A82F39"
                    >
                      {loading ? (
                        <ActivityIndicator color="#A82F39" />
                      ) : (
                        "Resend Code"
                      )}
                    </Button>
                  </View>
                )}
              </View>
            </View>

            <Button
              onPress={handleVerifyCode}
              disabled={loading || timeLeft === 0}
              style={{
                borderRadius: 100,
                marginTop: 32,
                width: "100%",
                padding: 10,
                backgroundColor: "#A82F39",
                opacity: loading || timeLeft === 0 ? 0.7 : 1,
              }}
              contentStyle={{
                backgroundColor: "#A82F39",
              }}
            >
              <Text className="text-center text-xl font-light text-white">
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  "Reset Password"
                )}
              </Text>
            </Button>

            <Button
              onPress={() => setStep("email")}
              mode="text"
              style={{ marginTop: 16 }}
              textColor="#374151"
            >
              Back to Email
            </Button>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Email Input Screen
  return (
    <LinearGradient colors={["#fff", "#E9F8FF"]} style={{ flex: 1 }}>
      <SafeAreaView className="container flex-1">
        <ScrollView contentContainerClassName="flex-1 justify-center">
          <Image
            source={require("@/assets/images/logo.png")}
            className="w-full h-44"
            resizeMode="contain"
          />

          <View className="w-full gap-6">
            <View className="items-center mb-4">
              <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
                Forgot Password?
              </Text>
              <Text className="text-gray-600 text-center leading-6">
                Enter your email address and we'll send you{"\n"}a verification
                code to reset your password.
              </Text>
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
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="Enter your email address"
            />
          </View>

          <Button
            onPress={handleSendCode}
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
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                "Send Verification Code"
              )}
            </Text>
          </Button>

          <Link href="/sign-in" className="text-center text-xl font-light mt-4">
            <Text>Back to Sign In</Text>
          </Link>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ForgotPassword;
