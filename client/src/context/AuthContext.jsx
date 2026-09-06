import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchCurrentUser, loginRequest } from "../services/api.js";
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

  const login = useCallback(async ({ email, password }) => {
    const response = await loginRequest({ email, password });
    const nextToken = response.data.token;
    const nextUser = response.data.user;
    persistAuth(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
    return nextUser;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      refreshUser,
    }),
    [user, token, loading, login, logout, refreshUser],
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
