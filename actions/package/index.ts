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
      const response = await axios.get(`/packages/get-all`);
      
      // Handle case where response.data might be undefined or null
      if (!response || !response.data) {
        console.error("Invalid response from packages API");
        return [];
      }

      // Handle different response structures
      const rawData = response.data.data || response.data || [];
      
      // Ensure rawData is an array
      if (!Array.isArray(rawData)) {
        console.error("Packages data is not an array:", rawData);
        return [];
      }

      const packages: Package[] = rawData.map((item: any) => ({
        packageId: item.packageId,
        package_name: item.name,
        durationDays: item.durationDays,
        description: item.description || "",
        sessions: item.sessions,
        price: item.price,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt || "",
        isActive: item.isActive ?? true,
        isGroup: item.isGroup ?? false,
        isVisible: item.isVisible ?? true,
        status: item.status || "active",
      }));
      
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

