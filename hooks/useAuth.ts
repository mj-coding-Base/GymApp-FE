import { useEffect, useState } from "react";
import { getGymIdFromToken } from "@/utils/jwt";

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [gymId, setGymId] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("x-auth-token");
    if (storedToken) {
      setToken(storedToken);
      // SECURITY FIX: Extract gymId from token, not localStorage
      // localStorage gym-id can be manipulated, token cannot
      const tokenGymId = getGymIdFromToken(storedToken);
      setGymId(tokenGymId);
      
      // SECURITY: Remove any gym-id from localStorage to prevent manipulation
      if (typeof window !== "undefined") {
        localStorage.removeItem("gym-id");
      }
    }
  }, []);

  const saveToken = (newToken: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("x-auth-token", newToken);
      setToken(newToken);
      
      // SECURITY: Extract gymId from new token
      const tokenGymId = getGymIdFromToken(newToken);
      setGymId(tokenGymId);
      
      // SECURITY: Remove any gym-id from localStorage
      localStorage.removeItem("gym-id");
    }
  };

  const clearToken = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("x-auth-token");
      localStorage.removeItem("gym-id"); // Also remove gym-id on logout
      setToken(null);
      setGymId(null);
    }
  };
  
  // SECURITY: Removed saveGymId() and clearGymId() functions
  // gymId should ONLY come from JWT token, never from localStorage
  // This prevents manipulation of gymId by users
  
  return { token, gymId, saveToken, clearToken };
};