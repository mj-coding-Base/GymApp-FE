// /app/(auth)/UserLoader.tsx
"use server";
import { useUserStore } from '@/hooks/useUserDetails';
import { decrypt } from '@/lib/authentication';
import { cookies } from 'next/headers';

export async function UserLoader({ children }: { children: React.ReactNode }) {
  const sessionCookie =  (await cookies()).get("session-gymapp-admin")?.value;

  let user = null;

  if (sessionCookie) {
    try {
      user = await decrypt(sessionCookie);
    } catch (error) {
      console.error('Failed to decrypt session', error);
    }
  }

  // Set user in Zustand store
  useUserStore.setState({ user });

  return <>{children}</>;
}