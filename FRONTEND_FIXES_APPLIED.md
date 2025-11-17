# Frontend API Compatibility Fixes Applied

## Summary

All frontend API requests have been verified and fixed to be compatible with the modified backend that uses `RequestContextService` and extracts `gymId` from JWT tokens.

## Changes Applied

### 1. Fixed `actions/upload/index.ts` ✅

**Issue:** Was using raw `axios` from "axios" package instead of configured instance.

**Fix:**
- Changed import from `import axios from "axios"` to `import axios from "@/utils/axios"`
- Added `import axiosRaw from "axios"` only for `CancelToken` (which is not available on the configured instance)
- Updated to use configured axios instance which goes through the interceptor
- Kept manual `x-auth-token` header setting for server-side compatibility

**Result:** Now uses the configured axios instance with proper interceptor behavior.

## Verification Results

### ✅ All API Calls Verified

1. **`actions/customers/index.ts`** ✅
   - Uses `@/utils/axios` ✅
   - No manual `gym-id` header ✅

2. **`actions/dashboard/index.ts`** ✅
   - Uses `@/utils/axios` ✅
   - Only sets `accept` header ✅

3. **`actions/session/index.ts`** ✅
   - Uses `@/utils/axios` ✅
   - No manual headers ✅

4. **`actions/dashboard/pendingPayments.ts`** ✅
   - Uses `@/utils/axios` ✅
   - No manual headers ✅

5. **`actions/auth/index.ts`** ✅
   - Uses `@/utils/axios` ✅
   - Manually sets `x-auth-token` (server-side, acceptable) ✅

6. **`actions/upload/index.ts`** ✅ **FIXED**
   - Now uses `@/utils/axios` ✅
   - Manually sets `x-auth-token` (server-side, acceptable) ✅

7. **`lib/authentication.ts`** ✅
   - Uses `@/utils/axios` ✅
   - No manual `gym-id` header ✅

8. **`components/customers/group/AddNewGroup.tsx`** ✅
   - Uses `@/utils/axios` ✅
   - No manual `gym-id` header ✅

9. **`pages/api/customer-proxy.ts`** ✅
   - Forwards `x-auth-token` correctly ✅
   - Does NOT add `gym-id` header ✅

## Axios Interceptor Configuration ✅

The axios interceptor in `utils/axios.ts` is correctly configured:

- ✅ Sets `x-auth-token` header from session/localStorage
- ✅ Does NOT send `gym-id` header
- ✅ Handles token refresh correctly
- ✅ Removes `gym-id` from localStorage

## Security Status ✅

- ✅ No `gym-id` stored in localStorage
- ✅ All `gymId` values extracted from JWT token only
- ✅ All API calls go through configured axios instance
- ✅ Token refresh handles `gymId` correctly

## Public Endpoints

### Note on `diy-add-customer` Endpoint

The backend endpoint `POST /customers/diy-add-customer`:
- Is marked with `@SkipAuthentication()`
- Uses `@Headers('gym-id')` to get gymId

**Status:** No frontend code currently calls this endpoint.

**If needed in the future:**
- This endpoint would need special handling to send `gym-id` header
- Consider adding it to a list of public endpoints that need `gym-id` header
- Or modify the endpoint to accept `gymId` in the request body instead

## Testing Recommendations

1. ✅ Test all authenticated endpoints - should work correctly
2. ✅ Test token refresh - should work correctly
3. ⚠️ Test `diy-add-customer` if it's used - will need `gym-id` header

## Conclusion

✅ **All frontend API requests are now compatible with the modified backend.**

The frontend correctly:
- Sends `x-auth-token` header for authentication
- Does NOT send `gym-id` header (backend extracts from token)
- Uses configured axios instance for all requests
- Handles token refresh correctly

**No further changes needed for existing API calls.**

