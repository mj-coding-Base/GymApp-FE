"use client";

import type { Trainer } from "@/types/TrainerDetails";

const TRAINERS_CACHE_KEY = "gymapp-trainers-cache";
const CACHE_EXPIRY_KEY = "gymapp-trainers-cache-expiry";
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

export const trainersCache = {
  /**
   * Get cached trainers data if available and not expired
   */
  get(): Trainer[] | null {
    if (typeof window === "undefined") return null;

    try {
      const cachedData = localStorage.getItem(TRAINERS_CACHE_KEY);
      const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);

      if (!cachedData || !expiry) return null;

      const expiryTime = parseInt(expiry, 10);
      const now = Date.now();

      // Check if cache is expired
      if (now > expiryTime) {
        this.clear();
        return null;
      }

      return JSON.parse(cachedData) as Trainer[];
    } catch (error) {
      console.error("Error reading trainers cache:", error);
      return null;
    }
  },

  /**
   * Set trainers data in cache with expiry time
   */
  set(data: Trainer[]): void {
    if (typeof window === "undefined") return;

    try {
      const expiry = Date.now() + CACHE_DURATION;
      localStorage.setItem(TRAINERS_CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_EXPIRY_KEY, expiry.toString());
    } catch (error) {
      console.error("Error setting trainers cache:", error);
    }
  },

  /**
   * Clear trainers cache
   */
  clear(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(TRAINERS_CACHE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
    } catch (error) {
      console.error("Error clearing trainers cache:", error);
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
      console.error("Error checking trainers cache validity:", error);
      return false;
    }
  },
};

