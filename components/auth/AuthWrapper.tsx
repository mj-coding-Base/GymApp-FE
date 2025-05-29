"use client";

import React, { useEffect } from "react";

import { useRouter } from "next/navigation";

import type { Session } from "@/lib/authentication";

const AuthWrapper = ({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) => {
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return <>{children}</>;
};

export default AuthWrapper;
