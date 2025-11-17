"use client";

import type { Trainer } from "@/types/TrainerDetails";

const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

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
 * Get gym-specific cache keys
 * 🔒 CRITICAL SECURITY: Includes gymId to prevent cross-tenant cache pollution
 */
function getCacheKeys(): { cacheKey: string; expiryKey: string } | null {
  const gymId = getGymIdFromToken();
  if (!gymId) return null;
  
  return {
    cacheKey: `gymapp-trainers-cache-${gymId}`,
    expiryKey: `gymapp-trainers-cache-expiry-${gymId}`,
  };
}

export const trainersCache = {
  /**
   * Get cached trainers data if available and not expired
   * 🔒 SECURITY: Returns data only for the current gym
   */
  get(): Trainer[] | null {
    if (typeof window === "undefined") return null;

    try {
      const keys = getCacheKeys();
      if (!keys) return null;
      
      const cachedData = localStorage.getItem(keys.cacheKey);
      const expiry = localStorage.getItem(keys.expiryKey);

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
   * 🔒 SECURITY: Stores data with gym-specific key
   */
  set(data: Trainer[]): void {
    if (typeof window === "undefined") return;

    try {
      const keys = getCacheKeys();
      if (!keys) return;
      
      const expiry = Date.now() + CACHE_DURATION;
      localStorage.setItem(keys.cacheKey, JSON.stringify(data));
      localStorage.setItem(keys.expiryKey, expiry.toString());
    } catch (error) {
      console.error("Error setting trainers cache:", error);
    }
  },

  /**
   * Clear trainers cache for current gym
   */
  clear(): void {
    if (typeof window === "undefined") return;

    try {
      const keys = getCacheKeys();
      if (!keys) return;
      
      localStorage.removeItem(keys.cacheKey);
      localStorage.removeItem(keys.expiryKey);
    } catch (error) {
      console.error("Error clearing trainers cache:", error);
    }
  },

  /**
   * Check if cache exists and is valid for current gym
   */
  isValid(): boolean {
    if (typeof window === "undefined") return false;

    try {
      const keys = getCacheKeys();
      if (!keys) return false;
      
      const expiry = localStorage.getItem(keys.expiryKey);
      if (!expiry) return false;

      const expiryTime = parseInt(expiry, 10);
      return Date.now() <= expiryTime;
    } catch (error) {
      console.error("Error checking trainers cache validity:", error);
      return false;
    }
  },
  
  /**
   * Clear ALL trainer caches (all gyms) - for logout or gym switch
   */
  clearAll(): void {
    if (typeof window === "undefined") return;
    
    try {
      // Find all trainer cache keys and remove them
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('gymapp-trainers-cache-') || key.startsWith('gymapp-trainers-cache-expiry-'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error("Error clearing all trainers caches:", error);
    }
  }
};

