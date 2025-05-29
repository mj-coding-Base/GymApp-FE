import AuthWrapper from "@/components/auth/AuthWrapper";
import { getSession } from "@/lib/authentication";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <AuthWrapper session={session}>
      <div className="flex flex-col items-start justify-center w-full min-h-screen bg-white border-1">
        <div className="w-full max-w-md px-5 py-16">{children}</div>
      </div>
    </AuthWrapper>
  );
}
