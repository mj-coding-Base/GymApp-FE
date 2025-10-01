// app/(protected)/(dashboard)/page.tsx
import DashboardWrapper from "@/components/dashboard/DashboardWrapper";
import { Suspense } from "react";

// Optimize for fast navigation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={
      <div className="m-auto flex items-center justify-center w-full h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <i className="loading-icon size-[30px] animate-spin" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <DashboardWrapper />
    </Suspense>
  );
}