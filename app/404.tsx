'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
export const dynamic = 'force-dynamic';
function NotFoundContent() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('query');

  return (
    <div>
      <h1>404 - Page Not Found</h1>
      {query && <p>You searched for: {query}</p>}
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback="Loading...">
      <NotFoundContent />
    </Suspense>
  );
}