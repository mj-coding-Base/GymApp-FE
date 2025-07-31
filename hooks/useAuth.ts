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
  const saveGymId = (gymId: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gym-id", gymId);
      setGymId(gymId);
    }
  };
    const clearGymId = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("gym-id");
      setGymId(null);
    }
  };
  return { token,gymId, saveToken, clearToken ,saveGymId,clearGymId};
};