// Client-side cache for equipment data (MULTI-TENANT AWARE)
// This provides instant loading when navigating between pages
// 🔒 SECURITY: Uses gymId-specific keys to prevent cross-tenant cache pollution
import { Equipment } from "@/types/Equipment";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
function getCacheKeys(): { cacheKey: string; timestampKey: string } | null {
  const gymId = getGymIdFromToken();
  if (!gymId) return null;
  
  return {
    cacheKey: `gymapp-equipment-cache-${gymId}`,
    timestampKey: `gymapp-equipment-timestamp-${gymId}`,
  };
}

class EquipmentCache {
  /**
   * Set equipment data in cache with current gym's key
   * 🔒 SECURITY: Stores data with gym-specific key
   */
  set(data: Equipment[]): void {
    if (typeof window === "undefined") return;
    
    try {
      const keys = getCacheKeys();
      if (!keys) return;
      
      localStorage.setItem(keys.cacheKey, JSON.stringify(data));
      localStorage.setItem(keys.timestampKey, Date.now().toString());
    } catch (error) {
      console.error("Error setting equipment cache:", error);
    }
  }

  /**
   * Get equipment data for current gym if available and not expired
   * 🔒 SECURITY: Returns data only for the current gym
   */
  get(): Equipment[] | null {
    if (typeof window === "undefined") return null;
    
    try {
      const keys = getCacheKeys();
      if (!keys) return null;
      
      const cachedData = localStorage.getItem(keys.cacheKey);
      const timestamp = localStorage.getItem(keys.timestampKey);
      
      if (!cachedData || !timestamp) {
        return null;
      }

      const timestampValue = parseInt(timestamp, 10);
      
      // Check if cache is still valid
      if (Date.now() - timestampValue > CACHE_DURATION) {
        this.clear();
        return null;
      }

      return JSON.parse(cachedData) as Equipment[];
    } catch (error) {
      console.error("Error reading equipment cache:", error);
      return null;
    }
  }

  /**
   * Clear equipment cache for current gym
   */
  clear(): void {
    if (typeof window === "undefined") return;
    
    try {
      const keys = getCacheKeys();
      if (!keys) return;
      
      localStorage.removeItem(keys.cacheKey);
      localStorage.removeItem(keys.timestampKey);
    } catch (error) {
      console.error("Error clearing equipment cache:", error);
    }
  }

  /**
   * Check if cache is stale for current gym
   */
  isStale(): boolean {
    if (typeof window === "undefined") return true;
    
    try {
      const keys = getCacheKeys();
      if (!keys) return true;
      
      const timestamp = localStorage.getItem(keys.timestampKey);
      if (!timestamp) return true;
      
      const timestampValue = parseInt(timestamp, 10);
      return Date.now() - timestampValue > CACHE_DURATION;
    } catch (error) {
      console.error("Error checking equipment cache staleness:", error);
      return true;
    }
  }
  
  /**
   * Clear ALL equipment caches (all gyms) - for logout or gym switch
   */
  clearAll(): void {
    if (typeof window === "undefined") return;
    
    try {
      // Find all equipment cache keys and remove them
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('gymapp-equipment-cache-') || key.startsWith('gymapp-equipment-timestamp-'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error("Error clearing all equipment caches:", error);
    }
  }
}

export const equipmentCache = new EquipmentCache();

