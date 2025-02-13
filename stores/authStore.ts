import { create } from 'zustand';

interface VehicleInfo {
  make: string;
  model: string;
  year: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  remember_token: string;
  email_verified_at: string;
  phone: string;
  vehicle_info: VehicleInfo;
  role: 'user' | 'provider';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
}));
