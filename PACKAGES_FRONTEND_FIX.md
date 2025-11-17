# Packages Frontend Multi-Tenant Fix

## Issue Found

**Problem:** `fetchAllPackages` server action had a module-level `ongoingRequest` variable that was shared across ALL requests, regardless of gym.

### Root Cause:
```typescript
// ❌ BEFORE: Shared across all gyms
let ongoingRequest: Promise<Package[]> | null = null;

export const fetchAllPackages = async (): Promise<Package[]> => {
  if (ongoingRequest) {
    return await ongoingRequest; // ❌ User A's request could return User B's data!
  }
  // ...
}
```

### Impact:
- If User A (Gym A) and User B (Gym B) called `fetchAllPackages` simultaneously:
  - User A's request starts first → `ongoingRequest` = Promise A
  - User B's request starts second → Returns Promise A (User A's data) ❌
  - **Cross-tenant data leakage!**

## Fix Applied

### Solution:
Changed to per-gym request tracking using a `Map<gymId, Promise>`:

```typescript
// ✅ AFTER: Per-gym request tracking
const ongoingRequestsByGym = new Map<string, Promise<Package[]>>();

export const fetchAllPackages = async (): Promise<Package[]> => {
  // Extract gymId from session (server-side)
  const session = await getSession();
  const token = session?.user.token;
  const gymId = token ? getGymIdFromToken(token) : null;
  
  // Only deduplicate within the same gym
  if (gymId) {
    const ongoingRequest = ongoingRequestsByGym.get(gymId);
    if (ongoingRequest) {
      return await ongoingRequest; // ✅ Only returns same gym's request
    }
  }
  
  // Create new request and store per gym
  const newRequest = (async (): Promise<Package[]> => {
    // ... fetch logic
  })();
  
  if (gymId) {
    ongoingRequestsByGym.set(gymId, newRequest);
  }
  
  return newRequest;
};
```

### Security Properties:
1. ✅ **Per-Gym Isolation**: Each gym has its own request cache
2. ✅ **Fail-Safe**: If `gymId` is missing, skips deduplication (prevents cross-tenant leakage)
3. ✅ **Automatic Cleanup**: Clears request from map after completion
4. ✅ **Concurrent Safety**: Multiple gyms can make requests simultaneously without interference

## Files Modified

1. ✅ `actions/package/index.ts` - Changed from module-level `ongoingRequest` to `Map<gymId, Promise>`

## Testing

After this fix, verify:
1. **Concurrent Requests**: User A and User B from different gyms can call `fetchAllPackages` simultaneously without seeing each other's data ✅
2. **Deduplication**: Multiple calls from the same gym within a short time window are deduplicated ✅
3. **Multi-Tenant Isolation**: Each gym only sees its own packages ✅

---

**Status:** Frontend Multi-Tenant Fix Complete ✅ | Backend Fix Complete ✅

**Note:** Both backend and frontend fixes are required for full multi-tenant isolation.

