import { Stack, usePathname } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
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
  const pathname = usePathname();
  useEffect(() => {
    const updateOrientation = async () => {
      if (
        pathname !== "/projects" &&
        pathname !== "/complaints" &&
        pathname !== "/invoices"
      ) {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
      } else {
        await ScreenOrientation.unlockAsync();
      }
    };

    updateOrientation();
  }, [pathname]);

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
        <Stack.Screen
          name="screens/admin/complaint/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="screens/admin/invoice/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </PaperProvider>
  );
}
