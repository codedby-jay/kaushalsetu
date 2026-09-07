import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchCurrentUser, loginRequest, registerRequest } from "../services/api.js";
import {
  clearAuthStorage,
  getStoredToken,
  getStoredUser,
  persistAuth,
} from "../utils/authStorage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(Boolean(getStoredToken()));

  const logout = useCallback(() => {
    clearAuthStorage();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      logout();
      setLoading(false);
      return null;
    }

    try {
      const response = await fetchCurrentUser();
      const nextUser = response.data.user;
      persistAuth(storedToken, nextUser);
      setToken(storedToken);
      setUser(nextUser);
      return nextUser;
    } catch {
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const applySession = useCallback((nextToken, nextUser) => {
    persistAuth(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
    return nextUser;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const response = await loginRequest({ email, password });
    return applySession(response.data.token, response.data.user);
  }, [applySession]);

  const register = useCallback(async ({ name, email, password, role }) => {
    const response = await registerRequest({ name, email, password, role });
    return applySession(response.data.token, response.data.user);
  }, [applySession]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
