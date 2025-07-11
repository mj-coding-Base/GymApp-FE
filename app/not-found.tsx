// app/not-found.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <Button 
        onClick={() => router.push('/')}
        className="mt-4"
      >
        Return Home
      </Button>
    </div>
  );
}