import { create } from "zustand";
import { getProfile } from "../API/00_LoginApi";

interface User {
  userId: number;
  username: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;

  // actions
  setToken: (token: string) => void;
  fetchUserProfile: () => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,

  setToken: (token) => {
    localStorage.setItem("accessToken", token);
    set({ accessToken: token });
  },

  fetchUserProfile: async () => {
    try {
      const profile = await getProfile();
      localStorage.setItem("userInfo", JSON.stringify(profile));
      set({ user: profile });
    } catch (err) {
      console.error("프로필 조회 실패:", err);
      get().logout();
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userInfo");
    set({ accessToken: null, user: null });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("userInfo");

    if (token) set({ accessToken: token });
    if (userData) set({ user: JSON.parse(userData) });
  }
}));