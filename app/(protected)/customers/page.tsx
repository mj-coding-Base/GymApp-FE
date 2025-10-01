import CustomersClient from "@/components/customers/CustomersClient";
import CustomersSkeleton from "@/components/customers/CustomersSkeleton";
import { Suspense } from "react";

// Optimize for fast navigation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  readonly searchParams: Promise<{
    page?: string;
    size?: string;
    search?: string;
    type?: string;
  }>;
}

export default async function Page({ searchParams }: Props) {
  const searchparams = await searchParams;

  // No blocking API calls - instant page load!
  // CustomersClient will show cached data immediately
  return (
    <Suspense fallback={<CustomersSkeleton />}>
      <CustomersClient searchParams={searchparams} />
    </Suspense>
  );
}