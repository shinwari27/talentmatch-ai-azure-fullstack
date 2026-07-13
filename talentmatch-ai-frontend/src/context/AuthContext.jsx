import React, { createContext, useState, useEffect } from 'react';
import * as authApi from '../services/authApi';
import { getToken, clearToken } from '../services/apiClient';

export const AuthContext = createContext(null);

function withAvatar(user) {
  if (!user) return null;
  const initials = user.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  return { ...user, avatar: initials };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Starts true: on first load we don't yet know if a stored token is valid,
  // so ProtectedRoute needs to wait rather than redirecting immediately.
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // On app load, if a token is sitting in localStorage from a previous
  // session, validate it against the backend and restore the user —
  // this is what keeps someone logged in across a page refresh.
  useEffect(() => {
    const existingToken = getToken();
    if (!existingToken) {
      setIsLoading(false);
      return;
    }

    authApi
      .getMe()
      .then((me) => setUser(withAvatar(me)))
      .catch(() => {
        // Token is expired or invalid — clear it rather than leaving a
        // dead token around that will just fail the same way every time.
        clearToken();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email, password) {
    setAuthError(null);
    try {
      const loggedInUser = await authApi.login({ email, password });
      setUser(withAvatar(loggedInUser));
      return loggedInUser;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  }

  async function register(data) {
    setAuthError(null);
    try {
      const newUser = await authApi.register(data);
      setUser(withAvatar(newUser));
      return newUser;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, authError, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
