"use client";

import { createContext, useContext, useEffect, useState } from "react";

// import { useRouter } from "next/navigation";
// TODO-

import {
  // logout,
  // updateAccessTokenInSession,
  // TODO-
  type Session,
} from "@/lib/authentication";
// import { refreshToken } from "@/actions/auth";
// TODO-
import { NotificationDataType } from "@/types/Notifications";

const SessionContext = createContext<
  { session: Session | null; notifications: NotificationDataType[] } | undefined
>(undefined);

export const SessionProvider: React.FC<{
  children: React.ReactNode;
  session: Session | null;
  notifications: NotificationDataType[];
}> = ({ children, session, notifications }) => {
  const [mounted, setMounted] = useState(false);

  // const router = useRouter();
  // TODO-

  useEffect(() => {
    setMounted(true);

    if (!session?.user.refreshToken) return;

    // Refresh access token every 5 minutes
    const refreshAccessToken = () => {
      // TODO-
      // refreshToken(session?.user.refreshToken as string).then(
      //   async (response) => {
      //     if (response.status === "SUCCESS") {
      //       const res = await updateAccessTokenInSession(
      //         response.data?._id as string
      //       );
      //       if (!res) {
      //         router.push("/sign-in");
      //       }
      //     } else {
      //       await logout();
      //       router.push("/sign-in");
      //     }
      //   }
      // );
    };

    if (!mounted) {
      refreshAccessToken();
    }

    const intervalId = setInterval(refreshAccessToken, 5 * 60 * 1000);

    return () => clearInterval(intervalId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <SessionContext.Provider value={{ session, notifications }}>
      {children}
    </SessionContext.Provider>
  );
};

// Session context
export const useSession = () => {
  const context = useContext(SessionContext);

  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context.session;
};

// Notifications context
export const useNotifications = () => {
  const context = useContext(SessionContext);

  if (context === undefined) {
    throw new Error("useNotifications must be used within a SessionProvider");
  }

  return context.notifications;
};