"use client";

import { DashboardData, fetchDashboardData } from "@/actions/dashboard";
import { dashboardCache } from "@/lib/dashboardCache";
import { getGymIdFromToken } from "@/utils/jwt";
import { useEffect, useState, useRef } from "react";
import Dashboard from "./Dashboard";
import DashboardSkeleton from "./DashboardSkeleton";

interface DashboardClientProps {
  readonly userName: string;
}

export default function DashboardClient({ userName }: DashboardClientProps) {
  // Track current gymId to detect user switches
  const currentGymIdRef = useRef<string | null>(null);
  
  // Initialize with cached data, but validate gymId first
  const [data, setData] = useState<DashboardData | null>(() => {
    // 🔒 SECURITY: Validate cache belongs to current gym before using
    const currentGymId = getGymIdFromToken(localStorage.getItem('x-auth-token'));
    if (!currentGymId) {
      // No token = no cache
      return null;
    }
    
    currentGymIdRef.current = currentGymId;
    const cached = dashboardCache.get();
    
    // If cache exists, it's already gym-specific (after our fix)
    return cached;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 🔒 SECURITY: Check if gymId changed (user switch)
    const checkGymIdChange = () => {
      const currentGymId = getGymIdFromToken(localStorage.getItem('x-auth-token'));
      
      if (currentGymId && currentGymId !== currentGymIdRef.current) {
        // Gym changed! Clear state and cache
        console.log(`[SECURITY] GymId changed from ${currentGymIdRef.current} to ${currentGymId}. Clearing cache.`);
        currentGymIdRef.current = currentGymId;
        setData(null);
        dashboardCache.clearAll();
        return true; // Indicates change detected
      }
      
      if (!currentGymIdRef.current && currentGymId) {
        // First time setting gymId
        currentGymIdRef.current = currentGymId;
      }
      
      return false;
    };
    
    // Check immediately
    checkGymIdChange();
    
    // Listen for storage changes (token updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'x-auth-token') {
        if (checkGymIdChange()) {
          // Force refetch if gymId changed
          window.location.reload(); // Most reliable way to clear all state
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also poll periodically to catch changes in same window (storage event only fires in other tabs)
    const pollInterval = setInterval(() => {
      if (checkGymIdChange()) {
        window.location.reload(); // Force full reload on gym change
      }
    }, 1000); // Check every second
    
    // Function to fetch fresh data
    const fetchFreshData = async () => {
      try {
        setIsRefreshing(true);
        setError(null);
        
        const freshData = await fetchDashboardData();
        
        // 🔒 SECURITY: Validate fresh data belongs to current gym
        const freshGymId = getGymIdFromToken(localStorage.getItem('x-auth-token'));
        if (freshGymId !== currentGymIdRef.current) {
          console.warn(`[SECURITY] GymId mismatch during fetch. Expected ${currentGymIdRef.current}, got ${freshGymId}. Discarding data.`);
          return; // Don't set data if gymId changed
        }
        
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
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
      clearInterval(intervalId);
    };
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

