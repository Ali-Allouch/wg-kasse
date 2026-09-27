"use client";

import { useState, useEffect } from "react";

export function useAuth() {
  // In a real application, this would involve more complex auth logic
  // e.g., checking tokens, fetching user data, etc.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Initialize state from localStorage directly on client-side render to prevent
    // hydration mismatches and ensure authentication status is immediately correct.
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token") === "mock_authenticated_user";
    }
    return false;
  });

  const login = (username: string, password: string) => {
    // Simulate a login process
    if (username === "user" && password === "password") {
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", "mock_authenticated_user");
      }
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
}
