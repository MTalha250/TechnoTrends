import { create } from "zustand";
import { User } from "@/types";

type AuthStore = {
  token: string | null;
  user: User | null;
  role: "director" | "admin" | "head" | "user" | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRole: (role: "director" | "admin" | "head" | "user" | null) => void;
  clearAuth: () => void;
};

const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  role: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setRole: (role) => set({ role }),
  clearAuth: () => set({ token: null, user: null, role: null }),
}));

export default useAuthStore;
