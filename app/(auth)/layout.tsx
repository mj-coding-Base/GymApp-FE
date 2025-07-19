

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
      <div className="flex flex-col items-start justify-center w-full min-h-screen bg-white border-1">
        <div className="w-full max-w-md px-5 py-16">{children}</div>
      </div>
  );
}
