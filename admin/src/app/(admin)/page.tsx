"use client";
import React, { useEffect, useState } from "react";
import useAuthStore from "@/store/authStore";
import { getDashboardStats, getUserDashboardStats } from "@/hooks/dashboard";
import StatCard from "@/components/dashboard/StatCard";
import ActivityChart from "@/components/dashboard/ActivityChart";
import RecentProjects from "@/components/dashboard/RecentProjects";
import RecentComplaints from "@/components/dashboard/RecentComplaints";
import RecentMaintenances from "@/components/dashboard/RecentMaintenances";
import { DashboardStats, UserDashboardStats, Project, Complaint, Maintenance } from "@/types";
import { LayoutDashboard } from "lucide-react";

export default function Dashboard() {
  const { user, token, role } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | UserDashboardStats | null>(null);

  const isUserRole = role === "user";

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        if (isUserRole) {
          const data = await getUserDashboardStats(token);
          setStats(data);
        } else {
          const data = await getDashboardStats(token);
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, isUserRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const statCards = isUserRole
    ? [
        { title: "Assigned Projects", value: stats?.activeProjects || 0, icon: "folder" as const },
        { title: "Assigned Complaints", value: stats?.activeComplaints || 0, icon: "alert" as const },
        { title: "Assigned Maintenances", value: stats?.activeMaintenances || 0, icon: "wrench" as const },
      ]
    : [
        { title: "Active Projects", value: stats?.activeProjects || 0, icon: "folder" as const },
        { title: "Active Complaints", value: stats?.activeComplaints || 0, icon: "alert" as const },
        { title: "Active Maintenances", value: stats?.activeMaintenances || 0, icon: "wrench" as const },
        { title: "Active Invoices", value: (stats as DashboardStats)?.activeInvoices || 0, icon: "receipt" as const },
      ];

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Welcome back, {user?.name?.split(" ")[0]}!
              </h1>
              <p className="text-primary-100 text-sm md:text-base mt-1">
                {currentDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary-100 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm w-fit">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="capitalize">{role} Dashboard</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={`grid gap-4 md:gap-6 ${isUserRole ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
        {statCards.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      {/* Activity Chart */}
      {stats && (
        <ActivityChart
          projects={stats.projects as Project[]}
          complaints={stats.complaints as Complaint[]}
          maintenances={stats.maintenances as Maintenance[]}
        />
      )}

      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentProjects
          projects={stats?.recentProjects || []}
          viewAllLink={isUserRole ? "/projects/user" : "/projects"}
        />
        <RecentComplaints
          complaints={stats?.recentComplaints || []}
          viewAllLink={isUserRole ? "/complaints/user" : "/complaints"}
        />
        <RecentMaintenances
          maintenances={stats?.recentMaintenances || []}
          viewAllLink={isUserRole ? "/maintenances/user" : "/maintenances"}
        />
      </div>
    </div>
  );
}
