"use client";

import type { DashboardData } from "@/actions/dashboard";

// Re-export for convenience
export type { DashboardData };

const DASHBOARD_CACHE_KEY = "gymapp-dashboard-cache";
const CACHE_EXPIRY_KEY = "gymapp-dashboard-cache-expiry";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const dashboardCache = {
  /**
   * Get cached dashboard data if available and not expired
   */
  get(): DashboardData | null {
    if (typeof window === "undefined") return null;

    try {
      const cachedData = localStorage.getItem(DASHBOARD_CACHE_KEY);
      const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);

      if (!cachedData || !expiry) return null;

      const expiryTime = parseInt(expiry, 10);
      const now = Date.now();

      // Check if cache is expired
      if (now > expiryTime) {
        // Clear expired cache
        this.clear();
        return null;
      }

      return JSON.parse(cachedData) as DashboardData;
    } catch (error) {
      console.error("Error reading dashboard cache:", error);
      return null;
    }
  },

  /**
   * Set dashboard data in cache with expiry time
   */
  set(data: DashboardData): void {
    if (typeof window === "undefined") return;

    try {
      const expiry = Date.now() + CACHE_DURATION;
      localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_EXPIRY_KEY, expiry.toString());
    } catch (error) {
      console.error("Error setting dashboard cache:", error);
    }
  },

  /**
   * Clear dashboard cache
   */
  clear(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(DASHBOARD_CACHE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
    } catch (error) {
      console.error("Error clearing dashboard cache:", error);
    }
  },

  /**
   * Check if cache exists and is valid
   */
  isValid(): boolean {
    if (typeof window === "undefined") return false;

    try {
      const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
      if (!expiry) return false;

      const expiryTime = parseInt(expiry, 10);
      return Date.now() <= expiryTime;
    } catch (error) {
      console.error("Error checking dashboard cache validity:", error);
      return false;
    }
  },
};

