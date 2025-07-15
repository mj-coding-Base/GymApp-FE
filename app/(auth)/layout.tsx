import AuthWrapper from "@/components/auth/AuthWrapper";
import { getSession } from "@/lib/authentication";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ✅ Prevent getSession() during static generation
  let session = null;

  if (typeof window === 'undefined') {
    // Running during static generation → skip session
    session = null;
  } else {
    // Running during SSR or client render → safe to fetch session
    session = await getSession();
  }

  return (
    <AuthWrapper session={session}>
      <div className="flex flex-col items-start justify-center w-full min-h-screen bg-white border-1">
        <div className="w-full max-w-md px-5 py-16">{children}</div>
      </div>
    </AuthWrapper>
  );
}