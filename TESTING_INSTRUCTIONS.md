# Multi-Tenant Isolation Testing Instructions

## Critical Fix Applied

**Problem:** Frontend caching was causing cross-gym data leakage.  
**Solution:** Made ALL caches multi-tenant aware with gym-specific keys.

---

## Quick Verification Test (5 minutes)

### Test 1: Concurrent Users from Different Gyms

1. **Browser 1** (Chrome):
   - Open: `http://localhost:3000/sign-in`
   - Login as: `punsara@payzhe.fit` (Punsara-Fitness)
   - Navigate to: Dashboard → Customers → Sessions
   - Note customer count, session count

2. **Browser 2** (Firefox/Incognito):
   - Open: `http://localhost:3000/sign-in`
   - Login as: `orion@payzhe.com` (Orion-Fitness)
   - Navigate to: Dashboard → Customers → Sessions
   - Note customer count, session count

3. **Verify:**
   - ✅ Each user sees ONLY their own gym's data
   - ✅ Customer counts are DIFFERENT
   - ✅ No data mixing

**Expected Results:**
- Punsara sees: 168 customers (from Punsara-Fitness)
- Orion sees: DIFFERENT count (from Orion-Fitness)
- ✅ ZERO overlap

---

### Test 2: Cache Inspection

**In Browser 1 (Punsara):**

1. Open DevTools (F12)
2. Go to: Application → Local Storage
3. Look for keys containing "Punsara-Fitness"

**Expected:**
```
gymapp-trainers-cache-Punsara-Fitness: [...]
gymapp-packages-cache-Punsara-Fitness: [...]
gymapp-equipment-cache-Punsara-Fitness: [...]
gymapp-trainers-cache-expiry-Punsara-Fitness: 1234567890
```

**In Browser 2 (Orion):**

Same steps - you should see "Orion-Fitness" keys instead.

**Verification:**
- ✅ DIFFERENT cache keys for each gym
- ✅ No shared keys between gyms

---

### Test 3: Logout and Switch

**Test:**
1. User A (Punsara) logs in
2. User A navigates to Customers (loads data)
3. User A logs out
4. User B (Orion) logs in immediately
5. User B navigates to Customers

**Verify:**
- ✅ User B sees ZERO data from User A
- ✅ localStorage cleared on logout
- ✅ Fresh data loaded for User B

---

## Detailed Testing (15 minutes)

### Test 4: Rapid Navigation (Cache Test)

**For User A (Punsara):**
1. Login
2. Navigate: Dashboard → Customers → Trainers → Packages → Equipment
3. Navigate back: Equipment → Packages → Trainers → Customers → Dashboard
4. Repeat 3-5 times rapidly

**For User B (Orion) - simultaneously in another browser:**
1. Login
2. Do the same navigation sequence

**Verify:**
- ✅ Each user's UI shows ONLY their data
- ✅ No flickering or wrong data appearing
- ✅ Cache speeds up navigation (should be instant on 2nd+ visit)

---

### Test 5: Backend Logs Verification

**While both users are logged in:**

1. Watch the backend console logs
2. Look for lines like:
   ```
   [RequestContextService] Context updated: gymId=Punsara-Fitness
   [GymIdValidationMonitor] ✅ GymId validation passed: repository.getAll (gymId: "Punsara-Fitness")
   ```

3. Verify:
   - ✅ Different `requestId` for each request
   - ✅ Correct `gymId` for each user
   - ✅ Different MongoDB collections queried:
     - `gym_punsara_fitness_customers` for Punsara
     - `gym_orion_fitness_customers` for Orion

---

## Edge Case Testing (10 minutes)

### Test 6: Page Refresh

**Test:**
1. User A (Punsara) loads Customers page
2. User A refreshes the page (F5)
3. Verify data is still correct (Punsara's data)

**Repeat for User B (Orion)**

**Expected:**
- ✅ Each user still sees only their data after refresh
- ✅ Cache persists correctly (per gym)

---

### Test 7: Network Failure Simulation

**Test:**
1. User A loads data
2. Open DevTools → Network → Throttle to "Offline"
3. Navigate to another page
4. Should see cached data (if implemented)
5. Go back online
6. Refresh and verify data is still correct

**Verify:**
- ✅ Cached data is correct for the gym
- ✅ No cross-gym data appears

---

## Monitoring (During Tests)

### Browser Console

Watch for cache-related logs:
```javascript
[CACHE] Key generated: gym:Punsara-Fitness:customers-individual-1-10
[ATTENDANCE] Component unmounting - cleared all caches
```

### Backend Console

Watch for validation logs:
```
✅ GymId validation passed: service.getAllSessions (gymId: "Punsara-Fitness")
✅ GymId validation passed: repository.getAllSessions (gymId: "Punsara-Fitness")
```

---

## What to Look For (Red Flags)

### ❌ Data Leakage Indicators

1. **Wrong Customer Count:**
   - User A sees count from User B's gym

2. **Wrong Customer Names:**
   - User A sees customer names from User B's gym

3. **Shared Cache Keys:**
   - Both users have same localStorage keys (e.g., `gymapp-trainers-cache` without gym suffix)

4. **Backend Validation Failures:**
   - Logs show: `🚨 CRITICAL SECURITY VIOLATION 🚨 GymId Validation Failure`

### ✅ Proper Isolation Indicators

1. **Different Data:**
   - Each user sees completely different data

2. **Gym-Specific Keys:**
   - localStorage has keys like `gymapp-trainers-cache-{gymId}`

3. **Backend Validations Pass:**
   - All logs show: `✅ GymId validation passed`

4. **Different Collections:**
   - Backend queries: `gym_punsara_fitness_customers` vs `gym_orion_fitness_customers`

---

## Expected Test Results

### ✅ All Tests Should Pass With:

1. **Zero Cross-Gym Data:**
   - Each user sees ONLY their gym's data
   - No customer/trainer/package mixing

2. **Proper Cache Keys:**
   - All localStorage keys include `gymId`
   - Format: `gymapp-{resource}-cache-{gymId}`

3. **Backend Isolation:**
   - All validation checks pass
   - Different collections queried per gym
   - Different `requestId` per request

4. **Logout Cleanup:**
   - All caches cleared on logout
   - No residual data for next user

---

## If Tests Fail

### Symptom: User B sees User A's data

**Debug:**
1. Check `localStorage` in DevTools
2. Look for cache keys WITHOUT `gymId` suffix
3. Check browser console for errors
4. Verify JWT token has correct `gymId`:
   ```javascript
   const token = localStorage.getItem('x-auth-token');
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('gymId:', payload.gymId);
   ```

### Symptom: Data loads slowly

**Debug:**
1. Cache might not be working
2. Check Network tab - should see API calls only on first load
3. Check cache keys are being generated correctly

### Symptom: Backend validation failures

**Debug:**
1. Check backend logs for error details
2. Verify `JwtAuthGuard` is setting context correctly
3. Check `RequestContextService` logs

---

## Automated Test Script (Optional)

Create `test-multi-tenancy.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Multi-Tenant Isolation', () => {
  test('should isolate data between gyms', async ({ browser }) => {
    // Create two browser contexts (like two different users)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // User 1 (Punsara) logs in
    await page1.goto('http://localhost:3000/sign-in');
    await page1.fill('input[name="email"]', 'punsara@payzhe.fit');
    await page1.fill('input[name="password"]', 'punsara@123');
    await page1.click('button[type="submit"]');
    await page1.waitForURL('**/dashboard');
    
    // User 2 (Orion) logs in
    await page2.goto('http://localhost:3000/sign-in');
    await page2.fill('input[name="email"]', 'orion@payzhe.com');
    await page2.fill('input[name="password"]', 'password');
    await page2.click('button[type="submit"]');
    await page2.waitForURL('**/dashboard');
    
    // Navigate to customers
    await page1.click('a[href="/customers"]');
    await page2.click('a[href="/customers"]');
    
    // Get customer counts
    const count1 = await page1.locator('[data-testid="customer-count"]').textContent();
    const count2 = await page2.locator('[data-testid="customer-count"]').textContent();
    
    // Verify they're different (assuming different gyms have different counts)
    expect(count1).not.toBe(count2);
    
    // Verify localStorage has gym-specific keys
    const storage1 = await page1.evaluate(() => localStorage);
    const storage2 = await page2.evaluate(() => localStorage);
    
    const hasGymSpecificKeys1 = Object.keys(storage1).some(key => key.includes('Punsara-Fitness'));
    const hasGymSpecificKeys2 = Object.keys(storage2).some(key => key.includes('Orion-Fitness'));
    
    expect(hasGymSpecificKeys1).toBe(true);
    expect(hasGymSpecificKeys2).toBe(true);
    
    await context1.close();
    await context2.close();
  });
});
```

---

## Success Criteria

### ✅ Test Passed If:

1. **Data Isolation:** Each user sees only their gym's data
2. **Cache Isolation:** localStorage has gym-specific keys
3. **Backend Isolation:** All validation checks pass in logs
4. **Logout Cleanup:** All caches cleared on logout
5. **Performance:** Pages load fast (cache working)
6. **Zero Errors:** No console errors or backend errors

### ❌ Test Failed If:

1. User B sees any data from User A's gym
2. localStorage has shared keys (no `gymId` suffix)
3. Backend logs show validation failures
4. Caches persist after logout

---

## Report Issues

If any test fails, provide:
1. Steps to reproduce
2. Browser console logs (screenshot)
3. Backend console logs (copy)
4. localStorage state (screenshot)
5. User details (which gym, which page)

---

**Test Duration:** 5-15 minutes  
**Required:** 2 browsers or 1 browser + incognito  
**Required:** Backend running with logs visible  
**Status:** Ready to test ✅

