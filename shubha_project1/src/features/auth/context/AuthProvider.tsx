import { createContext, useContext, ReactNode } from "react";
import type { StoredUser } from "@/shared/lib/api";

const DEV_USER: StoredUser = { id: "dev", email: "dev@kalai.app", role: "admin" };

interface AuthContextValue {
  user: StoredUser | null;
  setUser: (user: StoredUser | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: DEV_USER,
  setUser: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{ user: DEV_USER, setUser: () => {}, logout: async () => {} }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
