import { create } from "zustand";

type AuthStore = {
  token: string | null | undefined;
  user: User | null;
  role: string | null | undefined;
  setUser: (user: User | null) => void;
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
