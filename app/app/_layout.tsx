import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <PaperProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="screens/profile" options={{ headerShown: false }} />
        <Stack.Screen
          name="screens/admin/createProject"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="screens/admin/createComplaint"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="screens/admin/createInvoice"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="screens/admin/project/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </PaperProvider>
  );
}
