// app/(protected)/(dashboard)/page.tsx
import DashboardWrapper from "@/components/dashboard/DashboardWrapper";
export const dynamic = 'force-dynamic';
export default function Page() {
  return <DashboardWrapper />;
}