# 🔍 Multi-Tenant Data Leakage Diagnostic Checklist

## Step-by-Step Verification

### 1. Verify Frontend Rebuild
```bash
cd "F:\Personal_Projects\Gym project\GymApp-FE"
npm run clean
npm run build
npm run dev
```

### 2. Clear ALL Browser Storage
Open browser console and run:
```javascript
// Clear everything
localStorage.clear();
sessionStorage.clear();
// Clear IndexedDB if exists
indexedDB.databases().then(dbs => {
  dbs.forEach(db => indexedDB.deleteDatabase(db.name));
});
// Hard reload
location.reload();
```

### 3. Check Token Storage
After login, verify token has gymId:
```javascript
const token = localStorage.getItem('x-auth-token');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('gymId in token:', payload.gymId);
// Should show: "Hiru-Fitness" or "OXY-Fitness"
```

### 4. Check Cache Keys
After loading dashboard/customers:
```javascript
// Should see gym-specific keys
Object.keys(localStorage).filter(k => k.includes('cache'))
// Expected:
// - gymapp-dashboard-cache-Hiru-Fitness ✅
// - gymapp-customers-cache-Hiru-Fitness-individual-p1-s10-q ✅
// NOT:
// - gymapp-dashboard-cache (no gymId) ❌
```

### 5. Test User Switch
1. Login as User A (Hiru-Fitness)
2. Check console for: `[SECURITY] All caches cleared on login for gym: Hiru-Fitness`
3. Login as User B (OXY-Fitness) in same browser
4. Check console for: `[SECURITY] GymId changed from Hiru-Fitness to OXY-Fitness`
5. Page should auto-reload
6. Verify User B sees only OXY-Fitness data

### 6. Run Diagnostic Tool
```javascript
// In browser console:
verifyMultiTenantIsolation()
// Should show all checks passing ✅
```

## Common Issues

### Issue: "Still seeing wrong data"
**Possible Causes:**
1. ❌ Frontend not rebuilt → **Solution:** Rebuild frontend
2. ❌ Browser cache → **Solution:** Hard refresh (Ctrl+Shift+R)
3. ❌ Old localStorage → **Solution:** `localStorage.clear()`
4. ❌ Component not remounting → **Solution:** Check console for gymId change logs

### Issue: "Cache keys don't have gymId"
**Possible Causes:**
1. ❌ Code not rebuilt → **Solution:** Rebuild frontend
2. ❌ Old cache from before fix → **Solution:** `localStorage.clear()`

### Issue: "gymId change not detected"
**Possible Causes:**
1. ❌ Polling interval too slow → **Solution:** Already set to 1 second
2. ❌ Storage event not firing → **Solution:** Polling should catch it
3. ❌ Component not mounted → **Solution:** Check React DevTools

## Debug Commands

```javascript
// Check current gymId
getGymIdFromToken(localStorage.getItem('x-auth-token'))

// Check all cache keys
Object.keys(localStorage).filter(k => k.includes('cache'))

// Clear all caches manually
clearAllCaches()

// Verify isolation
verifyMultiTenantIsolation()
```

## Expected Console Logs

### On Login:
```
[SECURITY] All caches cleared on login for gym: Hiru-Fitness
```

### On Component Mount:
```
[SECURITY] GymId changed from null to Hiru-Fitness. Clearing cache.
```

### On User Switch:
```
[SECURITY] GymId changed from Hiru-Fitness to OXY-Fitness. Clearing cache.
```

## If Still Not Working

1. **Check Backend Logs:**
   - Should show different collections per gym
   - Should show different requestIds
   - Should show correct gymId in all logs

2. **Check Frontend Network Tab:**
   - Verify API requests include correct `x-auth-token` header
   - Verify responses contain correct data

3. **Check React DevTools:**
   - Verify component state
   - Check if components remount on navigation

4. **Check Browser Console:**
   - Look for errors
   - Check for `[SECURITY]` logs
   - Verify gymId in token

---

**If all checks pass but still seeing leakage, provide:**
1. Browser console logs
2. Network tab screenshots
3. localStorage contents
4. Backend logs

