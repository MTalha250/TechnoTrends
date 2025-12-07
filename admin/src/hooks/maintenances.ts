import axios from "axios";
import { Maintenance, CreateMaintenanceRequest } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getMaintenances = async (token: string): Promise<Maintenance[]> => {
  const { data } = await axios.get(`${API_URL}/maintenances`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getUserMaintenances = async (token: string): Promise<Maintenance[]> => {
  const { data } = await axios.get(`${API_URL}/maintenances/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getMaintenance = async (token: string, id: string): Promise<Maintenance> => {
  const { data } = await axios.get(`${API_URL}/maintenances/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const createMaintenance = async (token: string, maintenance: CreateMaintenanceRequest): Promise<Maintenance> => {
  const { data } = await axios.post(`${API_URL}/maintenances`, maintenance, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const updateMaintenance = async (token: string, id: string, maintenance: Partial<CreateMaintenanceRequest>): Promise<Maintenance> => {
  const { data } = await axios.put(`${API_URL}/maintenances/${id}`, maintenance, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const assignUsersToMaintenance = async (token: string, id: string, userIds: string[]): Promise<Maintenance> => {
  const { data } = await axios.post(
    `${API_URL}/maintenances/${id}/assign-users`,
    { userIds },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

export const deleteMaintenance = async (token: string, id: string): Promise<void> => {
  await axios.delete(`${API_URL}/maintenances/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
