'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { getSession as fetchSession } from "@/lib/authentication";
import { Session } from '@/types/auth';

interface SessionContextType {
  session: Session | null;
  refetchSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ 
  children,
  initialSession
}: { 
  children: ReactNode;
  initialSession: Session | null;
}) {
  const [session, setSession] = useState<Session | null>(initialSession);

  const refetchSession = useCallback(async () => {
    const newSession = await fetchSession();
    setSession(newSession);
  }, []);

  return (
    <SessionContext.Provider value={{ session, refetchSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}