import { useEffect, useState } from "react";

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [gymId, setGymId] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("x-auth-token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const saveToken = (newToken: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("x-auth-token", newToken);
      setToken(newToken);
    }
  };

  const clearToken = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("x-auth-token");
      setToken(null);
    }
  };
  // SECURITY: Removed saveGymId/clearGymId - gymId should NEVER be stored in localStorage
  // gymId must always be extracted from JWT token (signed, cannot be manipulated)
  // Storing gymId in localStorage is a security vulnerability
  return { token, gymId, saveToken, clearToken };
};