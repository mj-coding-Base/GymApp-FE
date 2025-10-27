import FinancesClient from "@/components/finance/FinancesClient";
import FinancesSkeleton from "@/components/finance/FinancesSkeleton";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FinancesPage() {
  return (
    <Suspense fallback={<FinancesSkeleton />}>
      <FinancesClient />
    </Suspense>
  );
}
