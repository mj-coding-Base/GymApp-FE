'use server'
import axios from "@/utils/axios";
// src/actions/packages.ts
import { CommonResponseDataType } from "@/types/Common";
import { Package } from "@/types/Packages";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/authentication";
import { getGymIdFromToken } from "@/utils/jwt";

// 🔒 CRITICAL SECURITY: Per-gym request tracking to prevent cross-tenant data leakage
// Each gym has its own ongoing request to ensure concurrent requests from different gyms don't interfere
const ongoingRequestsByGym = new Map<string, Promise<Package[]>>();

export const fetchAllPackages = async (): Promise<Package[]> => {
  // 🔒 SECURITY: Extract gymId from session (server-side) or token
  let gymId: string | null = null;
  try {
    const session = await getSession();
    const token = session?.user.token;
    gymId = token ? getGymIdFromToken(token) : null;
  } catch (error) {
    console.error('[SECURITY] Failed to extract gymId for packages request:', error);
    // Continue without gymId - will skip deduplication but still make request
  }

  // 🔒 SECURITY: Only deduplicate requests within the same gym
  // If gymId is missing, skip deduplication to prevent cross-tenant leakage
  if (gymId) {
    const ongoingRequest = ongoingRequestsByGym.get(gymId);
    if (ongoingRequest) {
      try {
        return await ongoingRequest;
      } catch (error) {
        // If the ongoing request fails, continue to make a new request
        ongoingRequestsByGym.delete(gymId);
      }
    }
  }

  // Create new request
  const newRequest = (async (): Promise<Package[]> => {
    try {
      // Extract gymId for this request (server-side or client-side)
      let requestGymId: string | null = null;
      try {
        if (typeof window === 'undefined') {
          // Server-side: get from session
          const session = await getSession();
          const token = session?.user.token;
          requestGymId = token ? getGymIdFromToken(token) : null;
        } else {
          // Client-side: get from localStorage token
          const token = localStorage.getItem('x-auth-token');
          requestGymId = token ? getGymIdFromToken(token) : null;
        }
      } catch (error) {
        console.error('[Packages] Failed to extract gymId for request:', error);
      }

      // Make request - axios interceptor will add x-auth-token and gym-id headers
      // Note: Backend endpoint has @SkipAuthentication() but uses @ValidatedGymId()
      // We send token and gym-id header to help backend extract gymId
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Packages] Making request to /packages/get-all with gymId:', requestGymId || 'not available');
      }
      
      const response = await axios.get(`/packages/get-all`, {
        // Include gymId in query params as additional fallback (though decorator doesn't read it)
        params: requestGymId ? { 'gym-id': requestGymId } : {},
      });
      
      // Handle case where response.data might be undefined or null
      if (!response || !response.data) {
        console.error("[Packages] Invalid response from packages API - no response or data");
        return [];
      }

      // Log response structure for debugging
      if (process.env.NODE_ENV !== 'production') {
        console.log("[Packages] API Response structure:", {
          hasData: !!response.data,
          hasDataData: !!response.data?.data,
          dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
          dataDataType: response.data?.data ? (Array.isArray(response.data.data) ? 'array' : typeof response.data.data) : 'none'
        });
      }

      // Handle different response structures
      // Backend returns array directly or wrapped in { packages: [...] }
      let rawData: any[] = [];
      
      if (Array.isArray(response.data)) {
        // Direct array response
        rawData = response.data;
      } else if (response.data?.packages && Array.isArray(response.data.packages)) {
        // Wrapped in { packages: [...] }
        rawData = response.data.packages;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        // Wrapped in { data: [...] }
        rawData = response.data.data;
      } else {
        console.error("[Packages] Unexpected response structure:", response.data);
        return [];
      }
      
      // Ensure rawData is an array
      if (!Array.isArray(rawData)) {
        console.error("[Packages] Packages data is not an array:", rawData);
        return [];
      }
      
      if (process.env.NODE_ENV !== 'production') {
        console.log("[Packages] Parsed", rawData.length, "packages from API");
      }

      const packages: Package[] = rawData.map((item: any) => {
        // Handle both _id and packageId (backend might return either)
        const packageId = item.packageId || item._id?.toString() || '';
        
        // Log mapping issues in development
        if (process.env.NODE_ENV !== 'production' && !packageId) {
          console.warn("[Packages] Package item missing ID:", item);
        }
        
        return {
          packageId: packageId,
          package_name: item.name || item.package_name || '',
          durationDays: item.durationDays || 0,
          description: item.description || "",
          sessions: item.sessions || 0,
          price: item.price || 0,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || "",
          isActive: item.isActive ?? true,
          isGroup: item.isGroup ?? false,
          isVisible: item.isVisible ?? true,
          status: item.status || "active",
        };
      });
      
      return packages;
    } catch (error: unknown) {
      // Log detailed error information for debugging
      if (error instanceof Error) {
        console.error("Failed to fetch packages:", error.message);
        // Log additional error details if available
        if ((error as any).response) {
          console.error("API Error Response:", {
            status: (error as any).response?.status,
            statusText: (error as any).response?.statusText,
            data: (error as any).response?.data,
          });
        }
      } else {
        console.error("Failed to fetch packages:", error);
      }

      // Return empty array instead of throwing - this prevents Server Component render errors
      return [];
    } finally {
      // 🔒 SECURITY: Clear ongoing request for this gym after completion
      if (gymId) {
        ongoingRequestsByGym.delete(gymId);
      }
    }
  })();

  // 🔒 SECURITY: Store request per gym to prevent cross-tenant interference
  if (gymId) {
    ongoingRequestsByGym.set(gymId, newRequest);
  }

  return newRequest;
};

export interface createNewPackage{
   name :  string,
   description :  string,
   sessions : number,
   durationDays : number,
   price : number,
   isGroup?: boolean,
   isVisible?: boolean
}

export async function createNewPackage(Newpackage:createNewPackage) {
  try {
    const response = await axios.post("/packages",Newpackage);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    return [];
  }
}

export const updatePackage = async (
  packageId: string,
  updatedData: Partial<createNewPackage>
): Promise<CommonResponseDataType> => {
  try {
    const res = await axios.patch(
      `/packages/${packageId}`,
      updatedData
    );

    revalidatePath(`/packages`);

    return res.data;
  } catch (error) {
    console.error(error);

    return error as CommonResponseDataType;
  }
};



export async function getPackages(): Promise<Package[]> {
  try {
    const response = await axios.get("/packages/get-all");
    console.log(response.data.data)
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    // Return dummy data if API fails
    return [];
  }
}

