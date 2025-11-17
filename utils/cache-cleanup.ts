/**
 * Cache Cleanup Utility
 * 
 * Ensures all caches are properly cleared and validated on app startup
 * and when gymId changes.
 */

import { getGymIdFromToken } from './jwt';

/**
 * Clear all multi-tenant caches
 * Used on login, logout, and gymId changes
 */
export async function clearAllMultiTenantCaches(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    const { trainersCache } = await import('@/lib/trainersCache');
    const { packagesCache } = await import('@/lib/packagesCache');
    const { equipmentCache } = await import('@/lib/equipmentCache');
    const { dashboardCache } = await import('@/lib/dashboardCache');
    const { customersCache } = await import('@/lib/customersCache');
    const { clearPendingRequests } = await import('@/utils/requestDeduplication');
    
    trainersCache.clearAll();
    packagesCache.clearAll();
    equipmentCache.clearAll();
    dashboardCache.clearAll();
    customersCache.clearAll();
    clearPendingRequests();
    
    console.log('[SECURITY] All multi-tenant caches cleared');
  } catch (error) {
    console.error('[SECURITY] Error clearing caches:', error);
  }
}

/**
 * Validate and clean up stale cache entries
 * Removes any cache entries that don't match the current gymId
 */
export function validateAndCleanCaches(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const currentGymId = getGymIdFromToken(localStorage.getItem('x-auth-token'));
    
    if (!currentGymId) {
      // No token = clear all caches
      clearAllMultiTenantCaches();
      return;
    }
    
    // Find and remove any cache keys that don't match current gymId
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      // Check for cache keys that should be gym-specific but aren't
      const isCacheKey = (
        key.startsWith('gymapp-') ||
        key.startsWith('gym:')
      );
      
      if (isCacheKey) {
        // If key doesn't include current gymId, it's stale
        if (!key.includes(currentGymId)) {
          keysToRemove.push(key);
        }
      }
    }
    
    if (keysToRemove.length > 0) {
      console.log(`[SECURITY] Removing ${keysToRemove.length} stale cache entries`);
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  } catch (error) {
    console.error('[SECURITY] Error validating caches:', error);
  }
}

/**
 * Initialize cache validation on app startup
 * Should be called once when the app loads
 */
export function initializeCacheValidation(): void {
  if (typeof window === 'undefined') return;
  
  // Validate immediately
  validateAndCleanCaches();
  
  // Also validate when token changes
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key: string, value: string) {
    originalSetItem.call(this, key, value);
    
    if (key === 'x-auth-token') {
      // Token changed - validate caches
      setTimeout(() => {
        validateAndCleanCaches();
      }, 100);
    }
  };
}

