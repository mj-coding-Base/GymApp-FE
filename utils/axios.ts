import { getSession } from "@/lib/authentication";
import axios, { AxiosError } from "axios";

const isServer = typeof window === "undefined";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.payzhe.fit/api/v1";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// ⚡ PERFORMANCE OPTIMIZATION: Cache to avoid repeated JWT decryptions
let serverAuthCache: { token: string | null; gymId: string | null; timestamp: number } | null = null;
const CACHE_DURATION = 5000; // 5 seconds cache

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
        gymId = session?.user.gymId ?? null;
        
        // Cache the values
        serverAuthCache = { token, gymId, timestamp: now };
      }
    } else {
      // Client-side: localStorage is already fast
      token = localStorage.getItem("x-auth-token");
      gymId = localStorage.getItem("gym-id");
    }

    // Set auth token if available
    if (token) {
      request.headers["x-auth-token"] = token;
    }

    // Set gymId in headers for all requests
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

    // Handle unauthorized errors specifically
    if (error.response?.status === 401) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Authentication failed");
      }
      // Clear auth cache on 401
      serverAuthCache = null;
    }

    // Extract error message
    const errorMessage = (resData && typeof resData === 'object' && 'message' in resData) 
      ? (resData as any).message 
      : error.message || 'API request failed';
    
    // Don't log "no data" responses as errors - these are expected business cases
    const isBusinessResponse = errorMessage && (
      errorMessage.includes("hasn't made any payments") ||
      errorMessage.includes("no payments") ||
      errorMessage.includes("not found") ||
      errorMessage.includes("No data found")
    );
    
    if (process.env.NODE_ENV !== 'production' && !isBusinessResponse) {
      console.error("[Axios Error]", resData || error.message);
    }
    
    // Always return proper Error object for Promise rejection
    const err = new Error(errorMessage) as any;
    if (resData && typeof resData === 'object') {
      err.response = resData;
    }
    return Promise.reject(err as Error);
  }
);

export default axiosInstance;