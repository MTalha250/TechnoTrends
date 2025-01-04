import React from "react";
import { Tabs } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Platform } from "react-native";

const AdminLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#A82F39",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            paddingHorizontal: 16,
            backgroundColor: "white",
            borderTopWidth: 1,
          },
          default: {
            paddingHorizontal: 16,
            backgroundColor: "white",
            borderTopWidth: 1,
          },
        }),
      }}
    >
      {/* Dashboard Tab */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="view-dashboard-outline"
              size={28}
              color={color}
            />
          ),
        }}
      />

      {/* Projects Tab */}
      <Tabs.Screen
        name="projects"
        options={{
          title: "Projects",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="folder-open" size={28} color={color} />
          ),
        }}
      />

      {/* Complaints Tab */}
      <Tabs.Screen
        name="complaints"
        options={{
          title: "Complaints",
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="report-gmailerrorred"
              size={28}
              color={color}
            />
          ),
        }}
      />

      {/* Invoices Tab */}
      <Tabs.Screen
        name="invoices"
        options={{
          title: "Invoices",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="receipt-long" size={28} color={color} />
          ),
        }}
      />

      {/* Approvals Tab */}
      <Tabs.Screen
        name="approvals"
        options={{
          title: "Approvals",
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="check-circle-outline"
              size={28}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default AdminLayout;
