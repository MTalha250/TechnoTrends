import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";
import useAuthStore from "@/store/authStore";
import { loginBack } from "@/hooks/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AuthLayout() {
  const { setToken, setUser, setRole, role, user } = useAuthStore();

  const handleLoginBack = async () => {
    try {
      const res = await loginBack();
      if (!res) {
        setToken("");
        setUser(null);
        setRole("");
        AsyncStorage.removeItem("token");
        return;
      }
      setUser(res?.user);
      setRole(res?.role);
      if (res?.token) {
        setToken(res.token);
      }
    } catch (error: any) {
      setToken("");
      setUser(null);
      AsyncStorage.removeItem("token");
    }
  };

  useEffect(() => {
    handleLoginBack();
  }, []);

  if (user)
    return role === "user" ? (
      <Redirect href="/userDashboard" />
    ) : (
      <Redirect href="/dashboard" />
    );

  return (
    <Stack>
      <Stack.Screen
        name="sign-in"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
