'use server'
import axios from "@/utils/axios";
import { CommonResponseDataType } from "@/types/Common";
import { Equipment, CreateEquipmentDto, UpdateEquipmentDto } from "@/types/Equipment";
import { revalidatePath } from "next/cache";

// Track ongoing requests to prevent duplicate calls (server-side only)
let ongoingRequest: Promise<Equipment[]> | null = null;

export const fetchAllEquipment = async (): Promise<Equipment[]> => {
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
  ongoingRequest = (async (): Promise<Equipment[]> => {
    try {
      const response = await axios.get(`/equipment/get-all`);
      
      // Handle case where response.data might be undefined or null
      if (!response || !response.data) {
        console.error("Invalid response from equipment API");
        return [];
      }

      // Log full response in development
      if (process.env.NODE_ENV === 'development') {
        console.log("📥 [fetchAllEquipment] API Response:", JSON.stringify(response.data, null, 2));
      }

      // Backend returns nested structure: { status: "SUCCESS", data: { data: { results: [...], totalResults: count } } }
      // So we need to access: response.data.data.data.results
      let rawData: any[] = [];
      
      // Try nested structure first: response.data.data.data.results
      if (response.data?.data?.data?.results && Array.isArray(response.data.data.data.results)) {
        rawData = response.data.data.data.results;
      } 
      // Fallback to: response.data.data.results
      else if (response.data?.data?.results && Array.isArray(response.data.data.results)) {
        rawData = response.data.data.results;
      } 
      // Fallback to: response.data.results
      else if (response.data?.results && Array.isArray(response.data.results)) {
        rawData = response.data.results;
      } 
      // Fallback to: response.data.data (if it's an array)
      else if (Array.isArray(response.data?.data)) {
        rawData = response.data.data;
      } 
      // Fallback to: response.data (if it's an array)
      else if (Array.isArray(response.data)) {
        rawData = response.data;
      }
      
      // Ensure rawData is an array
      if (!Array.isArray(rawData)) {
        console.error("Equipment data is not an array. Response structure:", {
          hasData: !!response.data,
          hasDataData: !!response.data?.data,
          hasResults: !!response.data?.data?.results,
          responseDataType: typeof response.data,
          responseDataData: response.data?.data,
        });
        return [];
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`Fetched ${rawData.length} equipment items`);
      }

      if (rawData.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log("No equipment items in response");
        }
        return [];
      }

      // Log first item structure for debugging (only in development)
      if (process.env.NODE_ENV === 'development' && rawData.length > 0) {
        console.log("Sample equipment item structure:", JSON.stringify(rawData[0], null, 2));
      }

      const equipmentMapped = rawData
        .filter((item: any) => item !== null && item !== undefined) // Filter out null/undefined items
        .map((item: any): Equipment | null => {
          try {
            return {
              _id: item._id?.toString() || item._id,
              equipmentId: item.equipmentId || "",
              gymId: item.gymId || "",
              createdAt: item.createdAt || "",
              updatedAt: item.updatedAt || "",
              status: item.status || "active",
              equipmentType: item.equipmentType || "unknown",
              equName: item.equName || "",
              model: item.model || undefined,
              brand: item.brand || undefined,
              location: item.location || undefined,
              purchaseDate: item.purchaseDate || undefined,
              quantityTotal: item.quantityTotal !== undefined && item.quantityTotal !== null ? Number(item.quantityTotal) : undefined,
              lastServicedAt: item.lastServicedAt || undefined,
              nextServiceDue: item.nextServiceDue || undefined,
              warranty: item.warranty || undefined,
              equipmentStatus: item.equipmentStatus || "available",
              images: Array.isArray(item.images) ? item.images : [],
              cost: item.cost !== undefined && item.cost !== null ? Number(item.cost) : undefined,
              description: item.description || undefined,
            };
          } catch (error) {
            console.error("Error mapping equipment item:", error, item);
            return null;
          }
        });
      
      const equipment: Equipment[] = equipmentMapped.filter((item): item is Equipment => item !== null); // Remove any null items from mapping errors
      
      // Log processed data in development
      if (process.env.NODE_ENV === 'development') {
        console.log("✅ [fetchAllEquipment] Processed Data:", {
          equipmentCount: equipment.length,
          sampleEquipment: equipment[0] || null,
        });
      }
      return equipment;
    } catch (error: unknown) {
      // Log detailed error information for debugging
      if (error instanceof Error) {
        console.error("Failed to fetch equipment:", error.message);
        // Log additional error details if available
        if ((error as any).response) {
          console.error("API Error Response:", {
            status: (error as any).response?.status,
            statusText: (error as any).response?.statusText,
            data: (error as any).response?.data,
          });
        }
      } else {
        console.error("Failed to fetch equipment:", error);
      }

      // Return empty array instead of throwing - this prevents Server Component render errors
      return [];
    } finally {
      // Clear ongoing request after completion
      ongoingRequest = null;
    }
  })();

  return ongoingRequest;
};

export async function createNewEquipment(equipment: CreateEquipmentDto) {
  try {
    const response = await axios.post("/equipment/add-equipment", equipment);
    return response.data;
  } catch (error) {
    console.error("Failed to create equipment:", error);
    throw error;
  }
}

export const updateEquipment = async (
  equipmentId: string,
  updatedData: UpdateEquipmentDto
): Promise<CommonResponseDataType> => {
  try {
    const res = await axios.patch(
      `/equipment/${equipmentId}`,
      updatedData
    );

    revalidatePath(`/equipment`);

    return res.data;
  } catch (error) {
    console.error(error);
    return error as CommonResponseDataType;
  }
};

export async function getEquipment(): Promise<Equipment[]> {
  try {
    const response = await axios.get("/equipment/get-all");

    // Log full response in development
    if (process.env.NODE_ENV === 'development') {
      console.log("📥 [getEquipment] API Response:", JSON.stringify(response.data, null, 2));
    }
    
    // Handle case where response.data might be undefined or null
    if (!response || !response.data) {
      console.error("Invalid response from equipment API");
      return [];
    }

    // Handle nested response structure: { status: "SUCCESS", data: { data: { results: [...] } } }
    let rawData: any[] = [];
    
    // Try nested structure first: response.data.data.data.results
    if (response.data?.data?.data?.results && Array.isArray(response.data.data.data.results)) {
      rawData = response.data.data.data.results;
    } 
    // Fallback to: response.data.data.results
    else if (response.data?.data?.results && Array.isArray(response.data.data.results)) {
      rawData = response.data.data.results;
    } 
    // Fallback to: response.data.results
    else if (response.data?.results && Array.isArray(response.data.results)) {
      rawData = response.data.results;
    } 
    // Fallback to: response.data.data (if it's an array)
    else if (Array.isArray(response.data?.data)) {
      rawData = response.data.data;
    } 
    // Fallback to: response.data (if it's an array)
    else if (Array.isArray(response.data)) {
      rawData = response.data;
    }
    
    // Ensure rawData is an array
    if (!Array.isArray(rawData)) {
      console.error("Equipment data is not an array:", rawData);
      return [];
    }

    // Map the data to Equipment type
    const equipmentMapped = rawData
      .filter((item: any) => item !== null && item !== undefined)
      .map((item: any): Equipment | null => {
        try {
          return {
            _id: item._id?.toString() || item._id,
            equipmentId: item.equipmentId || "",
            gymId: item.gymId || "",
            createdAt: item.createdAt || "",
            updatedAt: item.updatedAt || "",
            status: item.status || "active",
            equipmentType: item.equipmentType || "unknown",
            equName: item.equName || "",
            model: item.model || undefined,
            brand: item.brand || undefined,
            location: item.location || undefined,
            purchaseDate: item.purchaseDate || undefined,
            quantityTotal: item.quantityTotal !== undefined && item.quantityTotal !== null ? Number(item.quantityTotal) : undefined,
            lastServicedAt: item.lastServicedAt || undefined,
            nextServiceDue: item.nextServiceDue || undefined,
            warranty: item.warranty || undefined,
            equipmentStatus: item.equipmentStatus || "available",
            images: Array.isArray(item.images) ? item.images : [],
            cost: item.cost !== undefined && item.cost !== null ? Number(item.cost) : undefined,
            description: item.description || undefined,
          };
        } catch (error) {
          console.error("Error mapping equipment item:", error, item);
          return null;
        }
      });
    
    const equipment: Equipment[] = equipmentMapped.filter((item): item is Equipment => item !== null);

    // Log processed data in development
    if (process.env.NODE_ENV === 'development') {
      console.log("✅ [getEquipment] Processed Data:", {
        equipmentCount: equipment.length,
        sampleEquipment: equipment[0] || null,
      });
    }
    
    return equipment;
  } catch (error) {
    console.error("Failed to fetch equipment:", error);
    return [];
  }
}

export async function deleteEquipment(equipmentId: string): Promise<void> {
  try {
    // Use the _id (MongoDB ObjectId) for deletion
    await axios.delete(`/equipment/${equipmentId}`);
    revalidatePath(`/equipment`);
  } catch (error) {
    console.error("Failed to delete equipment:", error);
    throw error;
  }
}

