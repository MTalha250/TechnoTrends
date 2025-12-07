import axios from "axios";
import { User } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getApprovedUsers = async (token: string): Promise<User[]> => {
  const { data } = await axios.get(`${API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getPendingUsers = async (token: string): Promise<User[]> => {
  const { data } = await axios.get(`${API_URL}/users/pending`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const updateUserStatus = async (
  token: string,
  userId: string,
  status: "Approved" | "Rejected"
): Promise<User> => {
  const { data } = await axios.put(
    `${API_URL}/users/pending/${userId}`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

export const deleteUser = async (token: string, userId: string): Promise<void> => {
  await axios.delete(`${API_URL}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
