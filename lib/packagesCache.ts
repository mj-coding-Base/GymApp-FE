"use client";

import type { Package } from "@/types/Packages";

const PACKAGES_CACHE_KEY = "gymapp-packages-cache";
const CACHE_EXPIRY_KEY = "gymapp-packages-cache-expiry";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (packages change less frequently)

export const packagesCache = {
  /**
   * Get cached packages data if available and not expired
   */
  get(): Package[] | null {
    if (typeof window === "undefined") return null;

    try {
      const cachedData = localStorage.getItem(PACKAGES_CACHE_KEY);
      const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);

      if (!cachedData || !expiry) return null;

      const expiryTime = parseInt(expiry, 10);
      const now = Date.now();

      // Check if cache is expired
      if (now > expiryTime) {
        this.clear();
        return null;
      }

      return JSON.parse(cachedData) as Package[];
    } catch (error) {
      console.error("Error reading packages cache:", error);
      return null;
    }
  },

  /**
   * Set packages data in cache with expiry time
   */
  set(data: Package[]): void {
    if (typeof window === "undefined") return;

    try {
      const expiry = Date.now() + CACHE_DURATION;
      localStorage.setItem(PACKAGES_CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_EXPIRY_KEY, expiry.toString());
    } catch (error) {
      console.error("Error setting packages cache:", error);
    }
  },

  /**
   * Clear packages cache
   */
  clear(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(PACKAGES_CACHE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
    } catch (error) {
      console.error("Error clearing packages cache:", error);
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
      console.error("Error checking packages cache validity:", error);
      return false;
    }
  },
};

