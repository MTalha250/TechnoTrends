import { create } from "zustand";
import NotificationService from "@/services/notificationService";

type AuthStore = {
  token: string | null | undefined;
  user: User | null;
  role: string | null | undefined;
  pushToken: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRole: (role: string | null) => void;
  setPushToken: (token: string | null) => void;
  registerForNotifications: () => Promise<void>;
};

const useAuthStore = create<AuthStore>((set, get) => ({
  token: "",
  user: null,
  role: "",
  pushToken: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setRole: (role) => set({ role }),
  setPushToken: (pushToken) => set({ pushToken }),
  registerForNotifications: async () => {
    try {
      const token = await NotificationService.registerForPushNotifications();
      if (token) {
        set({ pushToken: token });
        const authToken = get().token;
        if (authToken) {
          await NotificationService.sendTokenToServer(token, authToken);
        }
      }
    } catch (error) {
      console.error("Failed to register for notifications:", error);
    }
  },
}));

export default useAuthStore;
