import React from "react";
import { Redirect, Tabs } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Platform } from "react-native";
import useAuthStore from "@/store/authStore";
const AdminLayout = () => {
  const { user, role } = useAuthStore();

  if (!user || !role) return <Redirect href="/sign-in" />;
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#A82F39",
        tabBarInactiveTintColor: "#A0A0A0",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            paddingHorizontal: 10,
            backgroundColor: "white",
            borderTopWidth: 1,
          },
          default: {
            paddingHorizontal: 10,
            backgroundColor: "white",
            borderTopWidth: 1,
            height: 60,
          },
        }),
      }}
    >
      {/* Dashboard Tab */}
      <Tabs.Screen
        name="dashboard"
        options={{
          href:
            role === "director" || role === "admin" || role === "head"
              ? "/dashboard"
              : null,
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="view-dashboard-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="userDashboard"
        options={{
          href: role === "user" ? "/userDashboard" : null,
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="view-dashboard-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Projects Tab */}
      <Tabs.Screen
        name="projects"
        options={{
          href:
            role === "director" ||
            role === "admin" ||
            (role === "head" &&
              (user.department === "technical" ||
                user.department === "it" ||
                user.department === "store"))
              ? "/projects"
              : null,
          title: "Projects",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="folder-open" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="userProjects"
        options={{
          href: role === "user" ? "/userProjects" : null,
          title: "Projects",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="folder-open" size={24} color={color} />
          ),
        }}
      />

      {/* Complaints Tab */}
      <Tabs.Screen
        name="complaints"
        options={{
          href:
            role === "director" ||
            role === "admin" ||
            (role === "head" &&
              (user.department === "technical" ||
                user.department === "it" ||
                user.department === "store"))
              ? "/complaints"
              : null,
          title: "Complaints",
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="report-gmailerrorred"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="userComplaints"
        options={{
          href: role === "user" ? "/userComplaints" : null,
          title: "Complaints",
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="report-gmailerrorred"
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Maintenances Tab */}
      <Tabs.Screen
        name="maintenances"
        options={{
          href:
            role === "director" ||
            role === "admin" ||
            (role === "head" &&
              (user.department === "technical" || user.department === "it"))
              ? "/maintenances"
              : null,
          title: "Maintenances",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="build" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="userMaintenances"
        options={{
          href: role === "user" ? "/userMaintenances" : null,
          title: "Maintenances",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="build" size={24} color={color} />
          ),
        }}
      />

      {/* Invoices Tab */}
      <Tabs.Screen
        name="invoices"
        options={{
          title: "Invoices",
          href:
            role === "director" ||
            role === "admin" ||
            (role === "head" &&
              (user.department === "accounts" || user.department === "sales"))
              ? "/invoices"
              : null,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="receipt-long" size={24} color={color} />
          ),
        }}
      />

      {/* Approvals Tab */}
      <Tabs.Screen
        name="approvals"
        options={{
          href: role === "director" || role === "admin" ? "/approvals" : null,
          title: "Approvals",
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="check-circle-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default AdminLayout;
