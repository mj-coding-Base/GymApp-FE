"use client";

import { Card, CardContent } from "@/components/ui/card";
import useUserDetails from "@/hooks/useUserDetails";
import { AlertCircle } from "lucide-react";

interface AdminGuardProps {
  readonly children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading } = useUserDetails();

  // Show loading state while checking
  if (loading) {
    return null;
  }

  // Debug: Log user data to console
  if (process.env.NODE_ENV !== 'production') {
    console.log('AdminGuard - User data:', user);
    console.log('AdminGuard - isAdmin value:', user?.isAdmin, typeof user?.isAdmin);
  }

  // Check if user is admin (convert to boolean to handle both string and boolean values)
  const isAdmin = user?.isAdmin === true || user?.isAdmin === "true" || user?.isAdmin === 1;

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-8 px-6">
            <div className="mb-4">
              <AlertCircle className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Permission Restricted
            </h2>
            <p className="text-sm text-gray-600 text-center">
              You do not have admin privileges to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

