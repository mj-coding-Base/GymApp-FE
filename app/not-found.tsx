'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
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