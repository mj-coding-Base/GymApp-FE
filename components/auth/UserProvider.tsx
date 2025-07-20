// components/auth/UserProvider.tsx
"use client";

import React, { useEffect } from "react";
import { useUserStore } from "@/hooks/useUserStore";

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser } = useUserStore();

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/user/me');
      const { user } = await res.json();
      setUser(user);
    };

    fetchUser();
  }, [setUser]);

  return <>{children}</>;
};