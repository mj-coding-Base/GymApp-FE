'use server'
import axios from "@/utils/axios";
// src/actions/packages.ts
import { CommonResponseDataType } from "@/types/Common";
import { Package } from "@/types/Packages";
import { revalidatePath } from "next/cache";

export const fetchAllPackages = async (): Promise<Package[]> => {
  // Wrap in additional try-catch to ensure no errors escape and break Server Component render
  try {
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
        // Log stack trace in development
        if (process.env.NODE_ENV !== 'production') {
          console.error("Error stack:", error.stack);
        }
      } else {
        console.error("Failed to fetch packages:", error);
      }

      // Return empty array instead of throwing - this prevents Server Component render errors
      return [];
    }
  } catch (outerError: unknown) {
    // Catch any unexpected errors that might escape the inner try-catch
    // This is a safety net to prevent Server Component render failures
    console.error("Unexpected error in fetchAllPackages:", outerError);
    return [];
  }
};

export interface createNewPackage{
   name :  string,
   description :  string,
   sessions : number,
   durationDays : number,
   price : number
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
      `/customers/${packageId}`,
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

