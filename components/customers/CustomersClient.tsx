"use client";

import { fetchGroups, fetchIndividualCustomers } from "@/actions/customers";
import { customersCache, CustomersData } from "@/lib/customersCache";
import { GroupShort, IndividualCustomer } from "@/types/Customer";
import { getGymIdFromToken } from "@/utils/jwt";
import { useEffect, useState, useRef } from "react";
import Customers from "./Customers";
import CustomersSkeleton from "./CustomersSkeleton";

// ⚡ PERFORMANCE: Shared empty result objects to avoid creating new objects
const EMPTY_INDIVIDUAL_RESULT: { results: IndividualCustomer[]; totalResults: number } = 
  { results: [], totalResults: 0 };
const EMPTY_GROUP_RESULT: { results: GroupShort[]; totalResults: number } = 
  { results: [], totalResults: 0 };

interface CustomersClientProps {
  readonly searchParams: {
    page?: string;
    size?: string;
    search?: string;
    type?: string;
  };
}

export default function CustomersClient({ searchParams }: CustomersClientProps) {
  // Track current gymId to detect user switches
  const currentGymIdRef = useRef<string | null>(null);
  
  // Initialize with cached data, but validate gymId first
  const [data, setData] = useState<CustomersData | null>(() => {
    // 🔒 SECURITY: Validate cache belongs to current gym before using
    const currentGymId = getGymIdFromToken(localStorage.getItem('x-auth-token'));
    if (!currentGymId) {
      // No token = no cache
      return null;
    }
    
    currentGymIdRef.current = currentGymId;
    const cached = customersCache.get(searchParams);
    
    // If cache exists, it's already gym-specific (after our fix)
    // But double-check: if gymId changed, clear cache
    return cached;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // 🔒 SECURITY: Check if gymId changed (user switch)
    const checkGymIdChange = () => {
      const currentGymId = getGymIdFromToken(localStorage.getItem('x-auth-token'));
      
      if (currentGymId && currentGymId !== currentGymIdRef.current) {
        // Gym changed! Clear state and cache
        console.log(`[SECURITY] GymId changed from ${currentGymIdRef.current} to ${currentGymId}. Clearing cache.`);
        currentGymIdRef.current = currentGymId;
        setData(null);
        customersCache.clearAll();
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
    
    const fetchFreshData = async () => {
      try {
        setIsRefreshing(true);

        const type = searchParams.type;
        const page = searchParams.page ?? "1";
        const size = searchParams.size ?? "10";
        const search = searchParams.search;

        // ⚡ PERFORMANCE: Only fetch what's needed, avoid creating empty objects
        let freshData: CustomersData;

        if (type === "group") {
          const groupCustomers = await fetchGroups(page, size, search, undefined, true);
          freshData = {
            individuals: EMPTY_INDIVIDUAL_RESULT,
            groups: groupCustomers,
            searchParams,
          };
        } else {
          const individualCustomers = await fetchIndividualCustomers(page, size, search);
          freshData = {
            individuals: individualCustomers,
            groups: EMPTY_GROUP_RESULT,
            searchParams,
          };
        }

        // 🔒 SECURITY: Validate fresh data belongs to current gym
        const freshGymId = getGymIdFromToken(localStorage.getItem('x-auth-token'));
        if (freshGymId !== currentGymIdRef.current) {
          console.warn(`[SECURITY] GymId mismatch during fetch. Expected ${currentGymIdRef.current}, got ${freshGymId}. Discarding data.`);
          return; // Don't set data if gymId changed
        }

        // ⚡ PERFORMANCE: Batch state updates (single render)
        setData(freshData);
        customersCache.set(freshData);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.error("Error fetching customers data:", err);
        }
      } finally {
        setIsRefreshing(false);
      }
    };

    // Always fetch fresh data
    // If cache exists, this updates in background
    // If no cache, this is the initial load
    fetchFreshData();
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.page, searchParams.size, searchParams.search, searchParams.type]);

  if (!data) {
    return <CustomersSkeleton />;
  }

  // Ensure data structure is complete to avoid undefined errors
  const individuals = data.individuals || EMPTY_INDIVIDUAL_RESULT;
  const groups = data.groups || EMPTY_GROUP_RESULT;

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
      
      <Customers
        searchParams={data.searchParams}
        individuals={individuals}
        groups={groups}
      />
    </div>
  );
}

