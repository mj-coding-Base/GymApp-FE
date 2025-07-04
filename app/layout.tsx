import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "@/components/common/Providers";

import "@/public/icons.css";
import "@/public/iconss.css";
import { SonnerProvider } from "@/components/ui/sonner-provider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "OXY-GYM",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scrollbar-stylish">
      <body className={cn("antialiased max-w-lg mx-auto", inter.className)}>
        {children}
        <Providers />
        <SonnerProvider
          position="top-center"
          closeButton={true}
          richColors={false}
          toastOptions={{
            duration: 2000,
          }}
        />
      </body>
    </html>
  );
}
