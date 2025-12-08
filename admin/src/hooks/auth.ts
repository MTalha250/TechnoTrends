import axios from "axios";
import { SignUpRequest } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const login = async (email: string, password: string, role: string) => {
  const { data } = await axios.post(`${API_URL}/users/login`, {
    email,
    password,
    role,
  });
  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.role);
  return data;
};

export const register = async (values: Omit<SignUpRequest, "confirmPassword">) => {
  const { data } = await axios.post(`${API_URL}/users/register`, values);
  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.user.role);
  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  return null;
};

export const loginBack = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return null;
  }

  try {
    const { data } = await axios.get(`${API_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const role = localStorage.getItem("role") || data.role;
    return { user: data.user, token, role };
  } catch {
    // If token is invalid, clear storage
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    return null;
  }
};

export const forgotPassword = async (email: string) => {
  const { data } = await axios.post(`${API_URL}/users/forgot-password`, {
    email,
  });
  return data;
};

export const verifyResetCode = async (
  email: string,
  code: string,
  newPassword: string
) => {
  const { data } = await axios.post(`${API_URL}/users/verify-reset-code`, {
    email,
    code,
    newPassword,
  });
  return data;
};

export const updateProfile = async (
  token: string,
  values: { name?: string; email?: string; phone?: string }
) => {
  const { data } = await axios.put(`${API_URL}/users/profile`, values, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const resetPassword = async (
  token: string,
  oldPassword: string,
  newPassword: string
) => {
  const { data } = await axios.put(
    `${API_URL}/users/reset-password`,
    { oldPassword, newPassword },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};
