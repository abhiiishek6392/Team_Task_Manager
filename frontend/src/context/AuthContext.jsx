import { createContext, useMemo, useState } from "react";
import { loginRequest, registerRequest } from "../api/authApi";

export const AuthContext = createContext(null);

function getStoredUser() {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    localStorage.removeItem("user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => getStoredUser());

  function saveSession(nextToken, nextUser) {
    const authUser = nextUser
      ? {
          id: nextUser.id,
          name: nextUser.name,
          email: nextUser.email,
          role: nextUser.role
        }
      : null;

    if (nextToken) {
      localStorage.setItem("token", nextToken);
    }

    if (authUser) {
      localStorage.setItem("user", JSON.stringify(authUser));
    }

    setToken(nextToken);
    setUser(authUser);
  }

  async function login(email, password) {
    const response = await loginRequest({ email, password });
    const { token: nextToken, user: nextUser } = response.data;

    saveSession(nextToken, nextUser);

    return response.data;
  }

  async function register({ name, email, password, role }) {
    const response = await registerRequest({
      name,
      email,
      password,
      role
    });

    if (response.data.token) {
      saveSession(response.data.token, response.data.user);
      return response.data;
    }

    return login(email, password);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
