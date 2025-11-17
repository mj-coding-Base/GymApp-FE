import { getSession, refreshToken } from "@/lib/authentication";
import { getGymIdFromToken } from "@/utils/jwt";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const isServer = globalThis.window === undefined;

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.payzhe.fit/api/v1" ; //|| "https://api.payzhe.fit/api/v1"  || "https://api.payzhe.fit/api/v1" 

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Note: Do NOT use a process-global server-side cache for auth values.
// Server-side requests are handled concurrently for different users; a global cache
// can cause cross-request contamination (wrong gymId/token used for another user).
// Always retrieve session per-request on the server to ensure correct isolation.

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null): void => {
  for (const prom of failedQueue) {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  }
  
  failedQueue = [];
};

// eslint-disable-next-line sonarjs/cognitive-complexity
axiosInstance.interceptors.request.use(async (request) => {
  try {
    // SECURITY: List of public endpoints that don't require authentication or gymId
    // These endpoints are marked with @SkipAuthentication() on the backend
    const publicEndpoints = [
      '/admin/admin-management/login',
      '/admin/admin-management/refresh-token',
      '/admin/admin-management/forgot-password',
      '/admin/admin-management/reset-password',
    ];
    
    // Check if this is a public endpoint (doesn't require gymId)
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      request.url?.includes(endpoint) || request.url?.endsWith(endpoint)
    );
    
    let token: string | null | undefined = null;
    let gymId: string | null | undefined = null;

    if (isServer) {
      // Always retrieve session per-request on the server to avoid sharing auth state
      try {
        const session = await getSession();
        token = session?.user.token ?? null;
        gymId = token ? getGymIdFromToken(token) : null;
      } catch (sessionError) {
        if (process.env.NODE_ENV !== 'production') {
          console.error("[Axios Request Interceptor] Session retrieval error:", sessionError);
        }
        token = null;
        gymId = null;
      }
    } else {
      // Client-side: Extract from localStorage and decode token
      token = localStorage.getItem("x-auth-token");
      // SECURITY: Always extract gymId from JWT token (signed, cannot be manipulated)
      gymId = token ? getGymIdFromToken(token) : null;
      
      // SECURITY: Never fallback to localStorage gymId - it can be manipulated
      // If token doesn't have gymId, that's a security issue
      if (!gymId && token) {
        // Log warning but don't block - let backend handle validation
        // Backend will reject if gymId is truly missing
        if (process.env.NODE_ENV !== 'production') {
          console.warn("SECURITY WARNING: Token exists but missing gymId. Backend will validate.");
        }
      }
    }

    // Set auth token if available (even for public endpoints, in case they need it)
    if (token) {
      request.headers["x-auth-token"] = token;
    }

    // 🔒 SECURITY: DO NOT send gym-id header
    // The backend extracts gymId from the JWT token (x-auth-token header)
    // This prevents cross-gym data leakage and ensures gymId is always from the signed JWT
    // The backend's AuthGuard validates the JWT and extracts gymId from the token payload
    
    // For public endpoints, they may need gymId but it should come from request params or body, not headers
    // Authenticated endpoints get gymId from JWT token automatically
    
    // Validate token has gymId (for logging/debugging only - backend will enforce)
    if (token && !isPublicEndpoint) {
      const tokenGymId = getGymIdFromToken(token);
      if (!tokenGymId && process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(
          `[SECURITY WARNING] Token missing gymId for request: ${request.url}. ` +
          `Backend will reject this request. Please ensure token includes gymId claim.`
        );
      }
    }

    return request;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("[Axios Request Interceptor] Error:", err);
    }
    // Return request even on error to avoid breaking the request flow
    return request;
  }
});

axiosInstance.interceptors.response.use(
  (response) => response,
  // eslint-disable-next-line sonarjs/cognitive-complexity
  (error: AxiosError) => {
    const resData = error.response?.data;

    if (resData && typeof resData === "string" && resData.includes("<!DOCTYPE html>")) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("[Axios] Received HTML instead of JSON. Possibly hit frontend route.");
      }
      return Promise.reject(new Error("Invalid API endpoint or baseURL misconfigured"));
    }

    // Handle unauthorized errors specifically - attempt token refresh
    if (error.response?.status === 401) {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      
      // Prevent infinite retry loops
      if (originalRequest._retry) {
        // Clear auth on final failure
        if (globalThis.window !== undefined) {
          localStorage.removeItem("x-auth-token");
          localStorage.removeItem("refresh-token");
        }
        return Promise.reject(error);
      }

      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers["x-auth-token"] = token as string;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            throw err;
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return refreshToken()
        // eslint-disable-next-line sonarjs/cognitive-complexity
        .then((refreshResult) => {
          if (refreshResult.success && refreshResult.token) {
            // Update cache
            if (!isServer) {
              // Client: persist new token in localStorage
              localStorage.setItem("x-auth-token", refreshResult.token);
            }

            // Extract gymId from NEW token (security: always use token gymId)
            const newTokenGymId = getGymIdFromToken(refreshResult.token);
            
            if (!newTokenGymId) {
              // Security: If new token doesn't have gymId, reject refresh
              if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.error("SECURITY: Refreshed token missing gymId");
              }
              processQueue(new Error("Refreshed token missing gymId"));
              if (globalThis.window !== undefined) {
                localStorage.removeItem("x-auth-token");
                localStorage.removeItem("refresh-token");
              }
              throw new Error("Security error: Invalid refreshed token");
            }

            // Update cache with new token (gymId is in token, not stored separately)
            if (!isServer) {
              localStorage.setItem("x-auth-token", refreshResult.token);
              // 🔒 SECURITY: Never store gymId in localStorage - always extract from token
              localStorage.removeItem("gym-id");
            }

            // Update request with new token (gymId is extracted from token by backend)
            if (originalRequest.headers) {
              originalRequest.headers["x-auth-token"] = refreshResult.token;
              // 🔒 SECURITY: Do NOT send gym-id header - backend extracts from JWT token
            }

            // Process queued requests with new token
            processQueue(null, refreshResult.token);

            // Retry original request
            return axiosInstance(originalRequest);
          }
          // Refresh failed
          processQueue(new Error("Token refresh failed"));
          if (globalThis.window !== undefined) {
            localStorage.removeItem("x-auth-token");
            localStorage.removeItem("refresh-token");
          }
          throw error;
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .catch((_refreshError) => {
          // Refresh failed, reject all queued requests
          processQueue(_refreshError);
          if (globalThis.window !== undefined) {
            localStorage.removeItem("x-auth-token");
            localStorage.removeItem("refresh-token");
          }
          throw _refreshError;
        })
        .finally(() => {
          isRefreshing = false;
        });
    }

    // Extract error message - use a function to ensure we always get a valid string
    // eslint-disable-next-line sonarjs/cognitive-complexity
    const getErrorMessage = (): string => {
      // Safely extract message from response data
      const getFromResponseData = (): string | null => {
        try {
          if (!resData || typeof resData !== 'object' || resData === null) {
            return null;
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const resAny = resData as any;
          if (resAny.message && String(resAny.message).trim().length > 0) {
            return String(resAny.message);
          }
          if (resAny.error && String(resAny.error).trim().length > 0) {
            return String(resAny.error);
          }
          return null;
        } catch {
          return null;
        }
      };

      const messageFromData = getFromResponseData();
      if (messageFromData) return messageFromData;

      // Try error.message
      try {
        if (error?.message) {
          const msg = String(error.message);
          if (msg && msg.trim().length > 0) {
            return msg;
          }
        }
      } catch {
        // Continue to next option
      }

      // Try statusText
      try {
        if (error?.response?.statusText) {
          const msg = String(error.response.statusText);
          if (msg && msg.trim().length > 0) {
            return msg;
          }
        }
      } catch {
        // Use default
      }

      // Always return a default string
      return 'API request failed';
    };

    // Safely get error message
    let errorMessage = 'API request failed';
    try {
      errorMessage = getErrorMessage();
    } catch {
      // Fallback to default message
      void 0;
    }
    
    // Ensure errorMessage is always a valid string
    if (!errorMessage || typeof errorMessage !== 'string') {
      errorMessage = 'API request failed';
    }
    
    // Don't log "no data" responses as errors - these are expected business cases
    const isBusinessResponse = errorMessage.includes("hasn't made any payments") ||
      errorMessage.includes("no payments") ||
      errorMessage.includes("not found") ||
      errorMessage.includes("No data found") ||
      errorMessage.includes("Cannot GET") ||
      error.response?.status === 404; // 404 errors are often expected (e.g., missing profile pictures)
    
    if (process.env.NODE_ENV !== 'production' && !isBusinessResponse) {
      console.error("[Axios Error]", resData || error.message);
    }
    
    // Always return proper Error object for Promise rejection
    try {
      // Create error with safe message
      const err = new Error(errorMessage) as any;
      
      // Attach response data if available
      if (resData && typeof resData === 'object') {
        err.response = resData;
      }
      
      // Preserve the original response status for error handling
      if (error.response?.status !== undefined) {
        if (!err.response) err.response = {};
        err.response.status = error.response.status;
      }
      
      return Promise.reject(err as Error);
    } catch {
      // Fallback: even if Error creation somehow fails, create a basic one
      const finalErr = new Error('API request failed');
      if (resData && typeof resData === 'object') {
        (finalErr as any).response = resData;
      }
      if (error.response?.status !== undefined) {
        if (!(finalErr as any).response) (finalErr as any).response = {};
        (finalErr as any).response.status = error.response.status;
      }
      return Promise.reject(finalErr);
    }
  }
);

export default axiosInstance;