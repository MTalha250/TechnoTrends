import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const login = async (email: string, password: string, role: string) => {
  const { data } = await axios.post(
    `${process.env.EXPO_PUBLIC_API_URL}/login`,
    {
      email,
      password,
      role,
    }
  );
  await AsyncStorage.setItem("token", data.token);
  return data;
};

export const register = async (values: object) => {
  const { data } = await axios.post(
    `${process.env.EXPO_PUBLIC_API_URL}/register`,
    values
  );
  return data;
};

export const logout = async () => {
  await axios.post(
    `${process.env.EXPO_PUBLIC_API_URL}/logout`,
    {},
    {
      headers: {
        Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
      },
    }
  );

  await AsyncStorage.removeItem("token");
  return null;
};

export const loginBack = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) {
    return null;
  }

  const { data } = await axios.get(
    `${process.env.EXPO_PUBLIC_API_URL}/get/by-token`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return { user: data.user, token, role: data.role };
};
