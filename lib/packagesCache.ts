"use client";

import type { Package } from "@/types/Packages";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (packages change less frequently)

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
    cacheKey: `gymapp-packages-cache-${gymId}`,
    expiryKey: `gymapp-packages-cache-expiry-${gymId}`,
  };
}

export const packagesCache = {
  /**
   * Get cached packages data if available and not expired
   * 🔒 SECURITY: Returns data only for the current gym
   */
  get(): Package[] | null {
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

      return JSON.parse(cachedData) as Package[];
    } catch (error) {
      console.error("Error reading packages cache:", error);
      return null;
    }
  },

  /**
   * Set packages data in cache with expiry time
   * 🔒 SECURITY: Stores data with gym-specific key
   */
  set(data: Package[]): void {
    if (typeof window === "undefined") return;

    try {
      const keys = getCacheKeys();
      if (!keys) return;
      
      const expiry = Date.now() + CACHE_DURATION;
      localStorage.setItem(keys.cacheKey, JSON.stringify(data));
      localStorage.setItem(keys.expiryKey, expiry.toString());
    } catch (error) {
      console.error("Error setting packages cache:", error);
    }
  },

  /**
   * Clear packages cache for current gym
   */
  clear(): void {
    if (typeof window === "undefined") return;

    try {
      const keys = getCacheKeys();
      if (!keys) return;
      
      localStorage.removeItem(keys.cacheKey);
      localStorage.removeItem(keys.expiryKey);
    } catch (error) {
      console.error("Error clearing packages cache:", error);
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
      console.error("Error checking packages cache validity:", error);
      return false;
    }
  },
  
  /**
   * Clear ALL package caches (all gyms) - for logout or gym switch
   */
  clearAll(): void {
    if (typeof window === "undefined") return;
    
    try {
      // Find all package cache keys and remove them
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('gymapp-packages-cache-') || key.startsWith('gymapp-packages-cache-expiry-'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error("Error clearing all packages caches:", error);
    }
  }
};

