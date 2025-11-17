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

const CACHE_EXPIRY_SUFFIX = "-expiry";
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes (shorter than dashboard since data changes more)

/**
 * Extract gymId from JWT token
 * 🔒 SECURITY: Used to create gym-specific cache keys
 */
function getGymIdFromToken(): string | null {
  if (typeof window === "undefined") return null;
  
  try {
    const token = localStorage.getItem('x-auth-token');
    if (!token) return null;
    
    // Decode JWT (second part is payload)
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload.gymId || null;
  } catch (error) {
    console.error('Failed to extract gymId from token:', error);
    return null;
  }
}

/**
 * Generate cache key based on gymId and search params
 * 🔒 CRITICAL SECURITY: Includes gymId to prevent cross-tenant cache pollution
 */
function getCacheKey(searchParams: CustomersData["searchParams"]): string | null {
  const gymId = getGymIdFromToken();
  if (!gymId) return null;
  
  const { page = "1", size = "10", search = "", type = "individual" } = searchParams;
  return `gymapp-customers-cache-${gymId}-${type}-p${page}-s${size}-q${search}`;
}

export const customersCache = {
  /**
   * Get cached customers data for specific search params
   * 🔒 SECURITY: Returns data only for the current gym
   */
  get(searchParams: CustomersData["searchParams"]): CustomersData | null {
    if (typeof window === "undefined") return null;

    try {
      const cacheKey = getCacheKey(searchParams);
      if (!cacheKey) return null;
      
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
   * 🔒 SECURITY: Stores data with gym-specific key
   */
  set(data: CustomersData): void {
    if (typeof window === "undefined") return;

    try {
      const cacheKey = getCacheKey(data.searchParams);
      if (!cacheKey) return;
      
      const expiryKey = cacheKey + CACHE_EXPIRY_SUFFIX;
      const expiry = Date.now() + CACHE_DURATION;

      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(expiryKey, expiry.toString());
    } catch (error) {
      console.error("Error setting customers cache:", error);
    }
  },

  /**
   * Clear specific customers cache for current gym
   */
  clear(searchParams: CustomersData["searchParams"]): void {
    if (typeof window === "undefined") return;

    try {
      const cacheKey = getCacheKey(searchParams);
      if (!cacheKey) return;
      
      const expiryKey = cacheKey + CACHE_EXPIRY_SUFFIX;

      localStorage.removeItem(cacheKey);
      localStorage.removeItem(expiryKey);
    } catch (error) {
      console.error("Error clearing customers cache:", error);
    }
  },

  /**
   * Clear all customers caches (all gyms) - for logout or gym switch
   */
  clearAll(): void {
    if (typeof window === "undefined") return;

    try {
      // Find all customer cache keys and remove them
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('gymapp-customers-cache-')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error("Error clearing all customers caches:", error);
    }
  },

  /**
   * Check if cache exists and is valid for specific params and current gym
   */
  isValid(searchParams: CustomersData["searchParams"]): boolean {
    if (typeof window === "undefined") return false;

    try {
      const cacheKey = getCacheKey(searchParams);
      if (!cacheKey) return false;
      
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

