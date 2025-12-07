import axios from "axios";
import { DashboardStats, UserDashboardStats } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getDashboardStats = async (token: string): Promise<DashboardStats> => {
  const { data } = await axios.get(`${API_URL}/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return {
    activeProjects: data.activeProjects || 0,
    activeComplaints: data.activeComplaints || 0,
    activeInvoices: data.activeInvoices || 0,
    activeMaintenances: data.activeMaintenances || 0,
    recentProjects: data.recentProjects || [],
    recentComplaints: data.recentComplaints || [],
    recentMaintenances: data.recentMaintenances || [],
    projects: data.allProjects || [],
    complaints: data.allComplaints || [],
    maintenances: data.allMaintenances || [],
  };
};

export const getUserDashboardStats = async (token: string): Promise<UserDashboardStats> => {
  const { data } = await axios.get(`${API_URL}/dashboard/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return {
    activeProjects: data.activeProjects || 0,
    activeComplaints: data.activeComplaints || 0,
    activeMaintenances: data.activeMaintenances || 0,
    recentProjects: data.recentProjects || [],
    recentComplaints: data.recentComplaints || [],
    recentMaintenances: data.recentMaintenances || [],
    projects: data.userProjects || [],
    complaints: data.userComplaints || [],
    maintenances: data.userMaintenances || [],
  };
};
