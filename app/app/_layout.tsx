import { Stack, usePathname } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import * as SplashScreen from "expo-splash-screen";
import { PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import NotificationService from "@/services/notificationService";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();

    // Setup notification listeners
    const notificationListener =
      NotificationService.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    const responseListener =
      NotificationService.addNotificationResponseReceivedListener(
        (response) => {
          console.log("Notification response:", response);
          // Handle notification tap here - navigate to specific screens based on data
          const data = response.notification.request.content.data;
          if (data?.type) {
            // You can add navigation logic here based on notification type
            console.log("Notification type:", data.type);
          }
        }
      );

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  const pathname = usePathname();
  useEffect(() => {
    const updateOrientation = async () => {
      if (
        pathname !== "/projects" &&
        pathname !== "/complaints" &&
        pathname !== "/invoices" &&
        pathname !== "/approvals"
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
          name="screens/createProject"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="screens/createComplaint"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="screens/createInvoice"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="screens/createMaintenance"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="screens/project/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="screens/complaint/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="screens/invoice/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="screens/maintenance/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </PaperProvider>
  );
}
