import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const login = async (email: string, password: string, role: string) => {
  const { data } = await axios.post(
    `${process.env.EXPO_PUBLIC_API_URL}/users/login`,
    {
      email,
      password,
      role,
    }
  );
  await AsyncStorage.setItem("token", data.token);
  return data;
};

export const register = async (values: SignUpRequest) => {
  const { data } = await axios.post(
    `${process.env.EXPO_PUBLIC_API_URL}/users/register`,
    values
  );
  return data;
};

export const logout = () => {
  AsyncStorage.removeItem("token");
  return null;
};

export const loginBack = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) {
    return null;
  }

  const { data } = await axios.get(
    `${process.env.EXPO_PUBLIC_API_URL}/users/profile`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return { user: data.user, token, role: data.role };
};
