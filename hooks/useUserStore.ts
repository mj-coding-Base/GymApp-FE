import { create } from "zustand";

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));