import { create } from "zustand";

type AuthStore = {
  token: string | null | undefined;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    isDirector: boolean;
    status: "Pending" | "Approved" | "Rejected";
    department: "accounts" | "technical" | "it" | "sales" | "store";
    created_at: string;
    updated_at: string;
  } | null;
  role: string | null | undefined;
  setUser: (
    user: {
      id: number;
      name: string;
      email: string;
      phone: string;
      isDirector: boolean;
      status: "Pending" | "Approved" | "Rejected";
      department: "accounts" | "technical" | "it" | "sales" | "store";
      created_at: string;
      updated_at: string;
    } | null
  ) => void;
  setToken: (token: string | null) => void;
  setRole: (role: string | null) => void;
};

const useAuthStore = create<AuthStore>((set) => ({
  token: "",
  user: null,
  role: "",
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setRole: (role) => set({ role }),
}));

export default useAuthStore;
