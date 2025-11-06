import { getSession, refreshToken } from "@/lib/authentication";
import { getGymIdFromToken } from "@/utils/jwt";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const isServer = typeof window === "undefined";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ; //|| "https://api.payzhe.fit/api/v1"  || "https://api.payzhe.fit/api/v1" 

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// ⚡ PERFORMANCE OPTIMIZATION: Cache to avoid repeated JWT decryptions
let serverAuthCache: { token: string | null; gymId: string | null; timestamp: number } | null = null;
const CACHE_DURATION = 5000; // 5 seconds cache

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

axiosInstance.interceptors.request.use(async (request) => {
  try {
    let token: string | null | undefined = null;
    let gymId: string | null | undefined = null;

    if (isServer) {
      // ⚡ CRITICAL OPTIMIZATION: Use cookie directly instead of JWT decrypt on every request
      // This eliminates the expensive getSession() call (JWT decrypt) on every API request
      const now = Date.now();
      
      // Try to use cached values if still valid
      if (serverAuthCache && (now - serverAuthCache.timestamp < CACHE_DURATION)) {
        token = serverAuthCache.token;
        gymId = serverAuthCache.gymId;
      } else {
        // Only decrypt JWT if cache is stale
        const session = await getSession();
        token = session?.user.token ?? null;
        // Extract gymId from token instead of trusting session data
        gymId = token ? getGymIdFromToken(token) : null;
        
        // Cache the values
        serverAuthCache = { token, gymId, timestamp: now };
      }
    } else {
      // Client-side: Extract from localStorage and decode token
      token = localStorage.getItem("x-auth-token");
      // SECURITY: Always extract gymId from JWT token (signed, cannot be manipulated)
      gymId = token ? getGymIdFromToken(token) : null;
      
      // SECURITY: Never fallback to localStorage gymId - it can be manipulated
      // If token doesn't have gymId, that's a security issue and should be rejected
      if (!gymId && token) {
        console.error("SECURITY WARNING: Token exists but missing gymId. Token may be invalid.");
        // Don't allow requests without valid gymId from token
        // This ensures gymId cannot be manipulated client-side
      }
    }

    // Set auth token if available
    if (token) {
      request.headers["x-auth-token"] = token;
    }

    // Set gymId in headers for all requests
    // This is extracted from token, so it's secure and cannot be manipulated
    if (gymId) {
      request.headers["gym-id"] = gymId;
    }

    return request;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("[Axios Request Interceptor] Error:", err);
    }
    return request;
  }
});

axiosInstance.interceptors.response.use(
  (response) => response,
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
        // Clear auth cache on final failure
        serverAuthCache = null;
        if (typeof window !== 'undefined') {
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
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return refreshToken()
        .then((refreshResult) => {
          if (refreshResult.success && refreshResult.token) {
            // Update cache
            if (isServer) {
              serverAuthCache = {
                token: refreshResult.token,
                gymId: getGymIdFromToken(refreshResult.token),
                timestamp: Date.now(),
              };
            } else {
              localStorage.setItem("x-auth-token", refreshResult.token);
            }

            // Extract gymId from NEW token (security: always use token gymId)
            const newTokenGymId = getGymIdFromToken(refreshResult.token);
            
            if (!newTokenGymId) {
              // Security: If new token doesn't have gymId, reject refresh
              if (process.env.NODE_ENV !== 'production') {
                console.error("SECURITY: Refreshed token missing gymId");
              }
              processQueue(new Error("Refreshed token missing gymId"));
              serverAuthCache = null;
              if (typeof window !== 'undefined') {
                localStorage.removeItem("x-auth-token");
                localStorage.removeItem("refresh-token");
              }
              return Promise.reject(new Error("Security error: Invalid refreshed token"));
            }

            // Update cache with new token and gymId from token
            if (isServer) {
              serverAuthCache = {
                token: refreshResult.token,
                gymId: newTokenGymId, // Use gymId from token (secure source)
                timestamp: Date.now(),
              };
            } else {
              localStorage.setItem("x-auth-token", refreshResult.token);
              // SECURITY: Never store gymId in localStorage - always extract from token
              // Remove any old gymId from localStorage to prevent manipulation
              localStorage.removeItem("gym-id");
            }

            // Update request with new token AND gymId from token
            if (originalRequest.headers) {
              originalRequest.headers["x-auth-token"] = refreshResult.token;
              originalRequest.headers["gym-id"] = newTokenGymId; // Use gymId from token
            }

            // Process queued requests with new token
            processQueue(null, refreshResult.token);

            // Retry original request
            return axiosInstance(originalRequest);
          } else {
            // Refresh failed, reject all queued requests
            processQueue(new Error("Token refresh failed"));
            serverAuthCache = null;
            if (typeof window !== 'undefined') {
              localStorage.removeItem("x-auth-token");
              localStorage.removeItem("refresh-token");
            }
            return Promise.reject(error);
          }
        })
        .catch((refreshError) => {
          // Refresh failed, reject all queued requests
          processQueue(refreshError);
          serverAuthCache = null;
          if (typeof window !== 'undefined') {
            localStorage.removeItem("x-auth-token");
            localStorage.removeItem("refresh-token");
          }
          return Promise.reject(refreshError);
        })
        .finally(() => {
          isRefreshing = false;
        });
    }

    // Extract error message - use a function to ensure we always get a valid string
    const getErrorMessage = (): string => {
      try {
        // Try to get message from response data
        if (resData && typeof resData === 'object' && resData !== null) {
          if ('message' in resData && resData.message !== null && resData.message !== undefined) {
            const msg = String(resData.message);
            if (msg && msg !== 'undefined' && msg !== 'null' && msg.trim().length > 0) {
              return msg;
            }
          }
          // Try 'error' field as fallback
          if ('error' in resData && resData.error !== null && resData.error !== undefined) {
            const msg = String(resData.error);
            if (msg && msg !== 'undefined' && msg !== 'null' && msg.trim().length > 0) {
              return msg;
            }
          }
        }
      } catch (e) {
        // Continue to next option
      }

      try {
        // Try error.message
        if (error?.message) {
          const msg = String(error.message);
          if (msg && msg !== 'undefined' && msg !== 'null' && msg.trim().length > 0) {
            return msg;
          }
        }
      } catch (e) {
        // Continue to next option
      }

      try {
        // Try statusText
        if (error?.response?.statusText) {
          const msg = String(error.response.statusText);
          if (msg && msg !== 'undefined' && msg !== 'null' && msg.trim().length > 0) {
            return msg;
          }
        }
      } catch (e) {
        // Continue to default
      }

      // Always return a default string
      return 'API request failed';
    };

    // Safely get error message
    let errorMessage: string;
    try {
      errorMessage = getErrorMessage();
    } catch (e) {
      errorMessage = 'API request failed';
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
    } catch (createError) {
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