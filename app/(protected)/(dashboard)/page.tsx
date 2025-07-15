// app/(protected)/(dashboard)/page.tsx

import DashboardWrapper from "@/components/dashboard/DashboardWrapper";

// ✅ Opt this route into dynamic rendering only
export const dynamic = 'force-dynamic';

export default async function Page() {
  // This will now run safely in SSR context
  return <DashboardWrapper />;
}