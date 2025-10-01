"use client";

import type { GroupShort, IndividualCustomer } from "@/types/Customer";

export type CustomersData = {
  individuals: {
    results: IndividualCustomer[];
    totalResults: number;
  };
  groups: {
    results: GroupShort[];
    totalResults: number;
  };
  searchParams: {
    page?: string;
    size?: string;
    search?: string;
    type?: string;
  };
};

const CUSTOMERS_CACHE_PREFIX = "gymapp-customers-cache";
const CACHE_EXPIRY_SUFFIX = "-expiry";
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes (shorter than dashboard since data changes more)

/**
 * Generate cache key based on search params to cache different queries separately
 */
function getCacheKey(searchParams: CustomersData["searchParams"]): string {
  const { page = "1", size = "10", search = "", type = "individual" } = searchParams;
  return `${CUSTOMERS_CACHE_PREFIX}-${type}-p${page}-s${size}-q${search}`;
}

export const customersCache = {
  /**
   * Get cached customers data for specific search params
   */
  get(searchParams: CustomersData["searchParams"]): CustomersData | null {
    if (typeof window === "undefined") return null;

    try {
      const cacheKey = getCacheKey(searchParams);
      const expiryKey = cacheKey + CACHE_EXPIRY_SUFFIX;

      const cachedData = localStorage.getItem(cacheKey);
      const expiry = localStorage.getItem(expiryKey);

      if (!cachedData || !expiry) return null;

      const expiryTime = parseInt(expiry, 10);
      const now = Date.now();

      // Check if cache is expired
      if (now > expiryTime) {
        // Clear expired cache
        this.clear(searchParams);
        return null;
      }

      return JSON.parse(cachedData) as CustomersData;
    } catch (error) {
      console.error("Error reading customers cache:", error);
      return null;
    }
  },

  /**
   * Set customers data in cache with expiry time
   */
  set(data: CustomersData): void {
    if (typeof window === "undefined") return;

    try {
      const cacheKey = getCacheKey(data.searchParams);
      const expiryKey = cacheKey + CACHE_EXPIRY_SUFFIX;
      const expiry = Date.now() + CACHE_DURATION;

      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(expiryKey, expiry.toString());
    } catch (error) {
      console.error("Error setting customers cache:", error);
    }
  },

  /**
   * Clear specific customers cache
   */
  clear(searchParams: CustomersData["searchParams"]): void {
    if (typeof window === "undefined") return;

    try {
      const cacheKey = getCacheKey(searchParams);
      const expiryKey = cacheKey + CACHE_EXPIRY_SUFFIX;

      localStorage.removeItem(cacheKey);
      localStorage.removeItem(expiryKey);
    } catch (error) {
      console.error("Error clearing customers cache:", error);
    }
  },

  /**
   * Clear all customers caches
   */
  clearAll(): void {
    if (typeof window === "undefined") return;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CUSTOMERS_CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Error clearing all customers caches:", error);
    }
  },

  /**
   * Check if cache exists and is valid for specific params
   */
  isValid(searchParams: CustomersData["searchParams"]): boolean {
    if (typeof window === "undefined") return false;

    try {
      const cacheKey = getCacheKey(searchParams);
      const expiryKey = cacheKey + CACHE_EXPIRY_SUFFIX;
      const expiry = localStorage.getItem(expiryKey);

      if (!expiry) return false;

      const expiryTime = parseInt(expiry, 10);
      return Date.now() <= expiryTime;
    } catch (error) {
      console.error("Error checking customers cache validity:", error);
      return false;
    }
  },
};

