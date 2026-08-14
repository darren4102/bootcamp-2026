import { createContext, useContext, useState, useCallback } from "react";
import { saveSession, readSession, clearSession } from "../utils/storage";

// Hardcoded, client-side-only credentials. This is a POC — never do this in production.
const USERS = [
  { username: "requester", password: "password", role: "Requester", displayName: "Luke Simurina" },
  { username: "approver", password: "password", role: "Approver", displayName: "Darren Nguyen" },
  { username: "manager", password: "password", role: "Manager", displayName: "Morgan Reyes" },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession());

  const login = useCallback((username, password) => {
    const match = USERS.find(
      (u) => u.username === username.trim().toLowerCase() && u.password === password
    );
    if (!match) {
      return { ok: false, error: "Incorrect username or password." };
    }
    const sessionUser = { username: match.username, role: match.role, displayName: match.displayName };
    saveSession(sessionUser);
    setUser(sessionUser);
    return { ok: true, user: sessionUser };
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
