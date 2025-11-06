'use server'
import axios from "@/utils/axios";
// src/actions/packages.ts
import { Package } from "@/types/Packages";
import { CommonResponseDataType } from "@/types/Common";
import { revalidatePath } from "next/cache";
import { packagesCache } from "@/lib/packagesCache";

// Track ongoing requests to prevent duplicate calls
let ongoingRequest: Promise<Package[]> | null = null;

export const fetchAllPackages = async (useCache: boolean = true): Promise<Package[]> => {
  // Check cache first if enabled
  if (useCache) {
    const cached = packagesCache.get();
    if (cached && cached.length > 0) {
      return cached;
    }
  }

  // If there's already an ongoing request, wait for it instead of making a new one
  if (ongoingRequest) {
    try {
      return await ongoingRequest;
    } catch (error) {
      // If the ongoing request fails, continue to make a new request
      ongoingRequest = null;
    }
  }

  // Create new request
  ongoingRequest = (async (): Promise<Package[]> => {
    try {
      const response = await axios.get(`/packages/get-all`);
      const rawData = response.data.data;

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

      // Cache the result
      packagesCache.set(packages);
      
      return packages;
    } catch (error: unknown) {
      console.error("Failed to fetch packages:", error);
      
      // On error, try to return cached data if available
      const cached = packagesCache.get();
      if (cached && cached.length > 0) {
        console.log("Returning cached packages due to error");
        return cached;
      }

      // If no cache, return empty array
      return [];
    } finally {
      // Clear ongoing request after completion
      ongoingRequest = null;
    }
  })();

  return ongoingRequest;
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

