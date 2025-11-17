/**
 * Multi-Tenant Cache Debug Utility
 * 
 * Use this to verify that multi-tenant isolation is working correctly.
 * Run these functions in the browser console to check cache isolation.
 */

/**
 * Check if cache keys are gym-specific
 */
export function checkCacheKeys(): {
  hasGymSpecificKeys: boolean;
  keys: string[];
  gymId: string | null;
  issues: string[];
} {
  if (typeof window === 'undefined') {
    return {
      hasGymSpecificKeys: false,
      keys: [],
      gymId: null,
      issues: ['Not in browser environment']
    };
  }

  const issues: string[] = [];
  const keys: string[] = [];
  
  // Get all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      keys.push(key);
    }
  }

  // Extract gymId from token
  const token = localStorage.getItem('x-auth-token');
  let gymId: string | null = null;
  
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        gymId = payload.gymId || null;
      }
    } catch (error) {
      issues.push('Failed to decode token');
    }
  } else {
    issues.push('No token found in localStorage');
  }

  // Check for non-gym-specific cache keys
  const problematicKeys = keys.filter(key => {
    // These should NOT exist (old format without gymId)
    return (
      key === 'gymapp-trainers-cache' ||
      key === 'gymapp-packages-cache' ||
      key === 'gymapp-equipment-cache' ||
      key === 'gymapp-trainers-cache-expiry' ||
      key === 'gymapp-packages-cache-expiry' ||
      key === 'gymapp-equipment-cache-expiry'
    );
  });

  if (problematicKeys.length > 0) {
    issues.push(`Found ${problematicKeys.length} non-gym-specific cache keys: ${problematicKeys.join(', ')}`);
  }

  // Check if gym-specific keys exist
  const hasGymSpecificKeys = gymId 
    ? keys.some(key => key.includes(`-${gymId}`) || key.includes(`gym:${gymId}`))
    : false;

  if (!hasGymSpecificKeys && gymId) {
    issues.push(`No gym-specific cache keys found for gymId: ${gymId}`);
  }

  return {
    hasGymSpecificKeys,
    keys,
    gymId,
    issues
  };
}

/**
 * Clear all caches (for testing)
 */
export function clearAllCaches(): void {
  if (typeof window === 'undefined') return;

  const keysToRemove: string[] = [];
  
  // Find all cache-related keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith('gymapp-') ||
      key.startsWith('gym:')
    )) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`Removed: ${key}`);
  });

  console.log(`✅ Cleared ${keysToRemove.length} cache keys`);
}

/**
 * Verify multi-tenant isolation
 */
export function verifyMultiTenantIsolation(): {
  passed: boolean;
  checks: Array<{ name: string; passed: boolean; message: string }>;
} {
  const checks: Array<{ name: string; passed: boolean; message: string }> = [];
  
  // Check 1: Token has gymId
  const token = localStorage.getItem('x-auth-token');
  let gymId: string | null = null;
  
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        gymId = payload.gymId || null;
        checks.push({
          name: 'Token has gymId',
          passed: !!gymId,
          message: gymId ? `✅ gymId: ${gymId}` : '❌ Token missing gymId'
        });
      } else {
        checks.push({
          name: 'Token format',
          passed: false,
          message: '❌ Invalid token format'
        });
      }
    } catch (error) {
      checks.push({
        name: 'Token decode',
        passed: false,
        message: '❌ Failed to decode token'
      });
    }
  } else {
    checks.push({
      name: 'Token exists',
      passed: false,
      message: '❌ No token found'
    });
  }

  // Check 2: Cache keys are gym-specific
  const cacheCheck = checkCacheKeys();
  checks.push({
    name: 'Gym-specific cache keys',
    passed: cacheCheck.hasGymSpecificKeys && cacheCheck.issues.length === 0,
    message: cacheCheck.hasGymSpecificKeys 
      ? `✅ Found gym-specific keys for ${cacheCheck.gymId}`
      : `❌ ${cacheCheck.issues.join('; ')}`
  });

  // Check 3: No shared cache keys
  const sharedKeys = [
    'gymapp-trainers-cache',
    'gymapp-packages-cache',
    'gymapp-equipment-cache'
  ].filter(key => localStorage.getItem(key) !== null);

  checks.push({
    name: 'No shared cache keys',
    passed: sharedKeys.length === 0,
    message: sharedKeys.length === 0
      ? '✅ No shared cache keys found'
      : `❌ Found ${sharedKeys.length} shared cache keys: ${sharedKeys.join(', ')}`
  });

  const passed = checks.every(check => check.passed);

  return {
    passed,
    checks
  };
}

// Make functions available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).checkCacheKeys = checkCacheKeys;
  (window as any).clearAllCaches = clearAllCaches;
  (window as any).verifyMultiTenantIsolation = verifyMultiTenantIsolation;
  
  console.log(`
🔍 Multi-Tenant Debug Tools Available:
  - checkCacheKeys() - Check cache key isolation
  - clearAllCaches() - Clear all caches
  - verifyMultiTenantIsolation() - Run full verification

Example:
  verifyMultiTenantIsolation()
  `);
}

