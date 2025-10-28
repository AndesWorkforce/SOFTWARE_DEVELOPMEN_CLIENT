"use client";

import { create, type StateCreator } from "zustand";

// Example: minimal auth store. Extend with slices as needed.
export type AuthState = {
  token: string | null;
  user: { id: string; email: string } | null;
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
  setToken: (token: string | null) => set({ token }),
  setUser: (user: AuthState["user"]) => set({ user }),
  logout: () => set({ token: null, user: null }),
});

export const useAuthStore = create<AuthState>()(authCreator);
