import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("libraryUser") || "null"); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("libraryToken");
    if (!token) { setLoading(false); return; }
    api("/auth/me")
      .then(data => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("libraryToken");
        localStorage.removeItem("libraryUser");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(membershipId) {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ membershipId })
    });
    localStorage.setItem("libraryToken", data.token);
    localStorage.setItem("libraryUser", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("libraryToken");
    localStorage.removeItem("libraryUser");
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>
    {children}
  </AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
