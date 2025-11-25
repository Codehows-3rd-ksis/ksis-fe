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
  isLoading: boolean;

  // actions
  setToken: (token: string) => void;
  fetchUserProfile: () => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  setToken: (token) => {
    localStorage.setItem("accessToken", token);
    set({ accessToken: token });
  },

  fetchUserProfile: async () => {
    try {
      const profile = await getProfile();
      localStorage.setItem("userInfo", JSON.stringify(profile));
      set({ user: profile });
      return profile; // 프로필 반환
    } catch (err) {
      console.error("프로필 조회 실패:", err);
      get().logout();
      throw err;  // 호출자에게 에러 던짐
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userInfo");
    set({ accessToken: null, user: null });
  },

  loadFromStorage: async () => {
    set({ isLoading: true });
    const token = localStorage.getItem("accessToken");
    if (token) {
      set({ accessToken: token });
      try {
        await get().fetchUserProfile();
      } catch {
        get().logout();
      }
    }
    set({ isLoading: false });
  }
}));