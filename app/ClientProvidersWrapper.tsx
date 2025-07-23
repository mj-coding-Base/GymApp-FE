"use client";

import dynamic from "next/dynamic";

const ClientProviders = dynamic(
  () => import("@/components/common/Providers"),
  {
    ssr: false,
    loading: () => <div className="p-4 text-center">Loading UI...</div>
  }
);

export default function ClientProvidersWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientProviders>{children}</ClientProviders>;
}