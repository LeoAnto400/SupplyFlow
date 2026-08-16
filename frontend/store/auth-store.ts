import { create } from "zustand";
import type { User } from "@/types";

interface AuthOrganization {
  id: string;
  name: string;
}

interface AuthState {
  user: User | null;
  organization: AuthOrganization | null;
  setSession: (user: User, organization?: AuthOrganization | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  organization: null,
  setSession: (user, organization = null) => set({ user, organization }),
  clear: () => set({ user: null, organization: null }),
}));
