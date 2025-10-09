import { createContext, useEffect, useState } from "react";
import api from "./api";

interface User {
  email: string;
  role?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // 🔹 Carrega sessão ao iniciar
  useEffect(() => {
    const savedToken = localStorage.getItem("accessToken") || localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser)); // 👈 agora espera um objeto
      } catch {
        setUser({ email: savedUser }); // compatibilidade retroativa
      }
      api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
    }
  }, []);

  // 🔹 Login
  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });

    const received = res.data?.accessToken || res.data?.token || res.data?.jwt || "";
    if (!received) throw new Error("Token não recebido do servidor.");

    const userObj: User = {
      email: res.data?.email || email,
      role: res.data?.role || "User",
    };

    setToken(received);
    setUser(userObj);

    localStorage.setItem("accessToken", received);
    localStorage.setItem("token", received);
    localStorage.setItem("user", JSON.stringify(userObj)); // 👈 salva objeto JSON

    api.defaults.headers.common["Authorization"] = `Bearer ${received}`;
  };

  // 🔹 Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
