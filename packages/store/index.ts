"use client";

import { create, type StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { setAuthToken } from "../setup/axios.config";

// Example: minimal auth store. Extend with slices as needed.
export type AuthState = {
  token: string | null;
  user: { id: string; email: string; role?: string } | null;
  setToken: (token: string | null) => void;
  setUser: (user: AuthState["user"]) => void;
  logout: () => void;
};

const authCreator: StateCreator<AuthState> = (
  set: (
    partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>),
    replace?: boolean,
  ) => void,
) => ({
  token: null,
  user: null,
  setToken: (token: string | null) => {
    setAuthToken(token); // Sync with axios
    set({ token });
  },
  setUser: (user: AuthState["user"]) => set({ user }),
  logout: () => {
    setAuthToken(null); // Clear axios token
    set({ token: null, user: null });
  },
});

export const useAuthStore = create<AuthState>()(
  persist(authCreator, {
    name: "auth-storage",
    onRehydrateStorage: () => (state) => {
      // Sync token with axios when rehydrating from storage
      if (state?.token) {
        setAuthToken(state.token);
      }
    },
  }),
);
