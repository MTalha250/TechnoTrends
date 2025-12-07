import axios from "axios";
import { Complaint, CreateComplaintRequest } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getComplaints = async (token: string): Promise<Complaint[]> => {
  const { data } = await axios.get(`${API_URL}/complaints`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getUserComplaints = async (token: string): Promise<Complaint[]> => {
  const { data } = await axios.get(`${API_URL}/complaints/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getComplaint = async (token: string, id: string): Promise<Complaint> => {
  const { data } = await axios.get(`${API_URL}/complaints/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const createComplaint = async (token: string, complaint: CreateComplaintRequest): Promise<Complaint> => {
  const { data } = await axios.post(`${API_URL}/complaints`, complaint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const updateComplaint = async (token: string, id: string, complaint: Partial<CreateComplaintRequest>): Promise<Complaint> => {
  const { data } = await axios.put(`${API_URL}/complaints/${id}`, complaint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const assignUsersToComplaint = async (token: string, id: string, userIds: string[]): Promise<Complaint> => {
  const { data } = await axios.post(
    `${API_URL}/complaints/${id}/assign-users`,
    { userIds },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

export const deleteComplaint = async (token: string, id: string): Promise<void> => {
  await axios.delete(`${API_URL}/complaints/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
