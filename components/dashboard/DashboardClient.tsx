"use client";

import { DashboardData, fetchDashboardData } from "@/actions/dashboard";
import { dashboardCache } from "@/lib/dashboardCache";
import { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import DashboardSkeleton from "./DashboardSkeleton";

interface DashboardClientProps {
  readonly userName: string;
}

export default function DashboardClient({ userName }: DashboardClientProps) {
  // Initialize with cached data immediately for instant load!
  const [data, setData] = useState<DashboardData | null>(() => {
    // This runs only once on mount - instant cache check
    return dashboardCache.get();
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to fetch fresh data
    const fetchFreshData = async () => {
      try {
        setIsRefreshing(true);
        setError(null);
        
        const freshData = await fetchDashboardData();
        
        if (freshData) {
          setData(freshData);
          // Cache the fresh data
          dashboardCache.set(freshData);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch dashboard data");
      } finally {
        setIsRefreshing(false);
      }
    };

    // Always fetch fresh data to update cache
    // If cache is invalid or doesn't exist, this is critical
    // If cache exists, this runs in background while showing cached data
    fetchFreshData();

    // Set up periodic refresh every 5 minutes
    const intervalId = setInterval(fetchFreshData, 5 * 60 * 1000);

    // Cleanup
    return () => clearInterval(intervalId);
  }, []); // Empty deps - only run on mount

  if (!data) {
    // Show skeleton loader for better perceived performance
    return <DashboardSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="m-auto flex items-center justify-center w-full h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <i className="danger-icon size-[30px] text-red-500" />
          <p className="text-sm text-red-600">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#F04237] text-white rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Show subtle loading indicator when refreshing in background */}
      {isRefreshing && (
        <div className="absolute top-0 right-0 z-10">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
            <i className="loading-icon size-[14px] animate-spin" />
            <span className="text-xs text-gray-600">Updating...</span>
          </div>
        </div>
      )}
      
      <Dashboard data={data} userName={userName} />
    </div>
  );
}

