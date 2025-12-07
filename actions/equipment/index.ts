'use server'
import axios from "@/utils/axios";
import { CommonResponseDataType } from "@/types/Common";
import { Equipment, CreateEquipmentDto, UpdateEquipmentDto, EquipmentType, MuscleGroup, EquipmentStatus } from "@/types/Equipment";
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
      // Backend endpoint: GET /equipments
      const response = await axios.get(`/equipments`);
      
      // Handle case where response.data might be undefined or null
      if (!response || !response.data) {
        console.error("Invalid response from equipment API");
        return [];
      }

      // Log full response in development
      if (process.env.NODE_ENV === 'development') {
        console.log("📥 [fetchAllEquipment] Full API Response:", JSON.stringify(response.data, null, 2));
        console.log("📥 [fetchAllEquipment] Response structure:", {
          hasData: !!response.data,
          hasDataData: !!response.data?.data,
          hasEquipments: !!response.data?.data?.equipments,
          dataType: typeof response.data,
          dataDataType: typeof response.data?.data,
        });
      }

      // Backend returns: { equipments: EquipmentDocument[], total: number, page: number, limit: number }
      // Wrapped by ApiResponseInterceptor: { status: "SUCCESS", data: { equipments: [...], total, page, limit } }
      let rawData: any[] = [];
      
      // Try nested structure first: response.data.data.equipments (most common)
      if (response.data?.data?.equipments && Array.isArray(response.data.data.equipments)) {
        rawData = response.data.data.equipments;
        if (process.env.NODE_ENV === 'development') {
          console.log("✅ [fetchAllEquipment] Found data at response.data.data.equipments:", rawData.length, "items");
        }
      } 
      // Fallback to: response.data.equipments (if not wrapped)
      else if (response.data?.equipments && Array.isArray(response.data.equipments)) {
        rawData = response.data.equipments;
        if (process.env.NODE_ENV === 'development') {
          console.log("✅ [fetchAllEquipment] Found data at response.data.equipments:", rawData.length, "items");
        }
      }
      // Fallback to: response.data.data.data.results (old structure)
      else if (response.data?.data?.data?.results && Array.isArray(response.data.data.data.results)) {
        rawData = response.data.data.data.results;
        if (process.env.NODE_ENV === 'development') {
          console.log("✅ [fetchAllEquipment] Found data at response.data.data.data.results:", rawData.length, "items");
        }
      } 
      // Fallback to: response.data.data.results
      else if (response.data?.data?.results && Array.isArray(response.data.data.results)) {
        rawData = response.data.data.results;
        if (process.env.NODE_ENV === 'development') {
          console.log("✅ [fetchAllEquipment] Found data at response.data.data.results:", rawData.length, "items");
        }
      } 
      // Fallback to: response.data.results
      else if (response.data?.results && Array.isArray(response.data.results)) {
        rawData = response.data.results;
        if (process.env.NODE_ENV === 'development') {
          console.log("✅ [fetchAllEquipment] Found data at response.data.results:", rawData.length, "items");
        }
      } 
      // Fallback to: response.data.data (if it's an array directly)
      else if (Array.isArray(response.data?.data)) {
        rawData = response.data.data;
        if (process.env.NODE_ENV === 'development') {
          console.log("✅ [fetchAllEquipment] Found data at response.data.data (array):", rawData.length, "items");
        }
      } 
      // Fallback to: response.data (if it's an array directly)
      else if (Array.isArray(response.data)) {
        rawData = response.data;
        if (process.env.NODE_ENV === 'development') {
          console.log("✅ [fetchAllEquipment] Found data at response.data (array):", rawData.length, "items");
        }
      }
      
      // Ensure rawData is an array
      if (!Array.isArray(rawData)) {
        console.error("❌ [fetchAllEquipment] Equipment data is not an array. Response structure:", {
          hasData: !!response.data,
          hasDataData: !!response.data?.data,
          hasEquipments: !!response.data?.data?.equipments,
          responseDataType: typeof response.data,
          responseDataData: response.data?.data,
          responseDataKeys: response.data ? Object.keys(response.data) : [],
          responseDataDataKeys: response.data?.data ? Object.keys(response.data.data) : [],
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
            // Handle both new structure (name) and legacy structure (equName)
            const equipmentName = item.name || item.equName || "";
            const equipmentType = item.type || item.equipmentType || EquipmentType.UNKNOWN;
            const equipmentStatus = item.status || item.equipmentStatus || EquipmentStatus.AVAILABLE;
            
            // Log if we're using legacy fields
            if (process.env.NODE_ENV === 'development' && (item.equName || item.equipmentType || item.equipmentStatus)) {
              console.log("⚠️ [fetchAllEquipment] Using legacy field names for equipment:", {
                _id: item._id,
                hasEquName: !!item.equName,
                hasName: !!item.name,
                hasEquipmentType: !!item.equipmentType,
                hasType: !!item.type,
              });
            }
            
            const mapped: Equipment = {
              _id: item._id?.toString() || item._id || "",
              equipmentId: item.equipmentId || item._id?.toString() || "",
              gymId: item.gymId || "",
              name: equipmentName,
              sku: item.sku,
              type: equipmentType,
              muscleGroups: Array.isArray(item.muscleGroups) && item.muscleGroups.length > 0 
                ? item.muscleGroups 
                : (item.muscleGroups ? [item.muscleGroups] : [MuscleGroup.UNKNOWN]),
              model: item.model || "",
              brand: item.brand || "",
              serialNumber: item.serialNumber,
              location: item.location || { room: undefined, zone: undefined },
              quantityTotal: item.quantityTotal !== undefined && item.quantityTotal !== null ? Number(item.quantityTotal) : 1,
              quantityAvailable: item.quantityAvailable !== undefined && item.quantityAvailable !== null 
                ? Number(item.quantityAvailable) 
                : (item.quantityTotal !== undefined && item.quantityTotal !== null ? Number(item.quantityTotal) : 1),
              status: equipmentStatus,
              lastServicedAt: item.lastServicedAt ? (typeof item.lastServicedAt === 'string' ? item.lastServicedAt : new Date(item.lastServicedAt).toISOString()) : undefined,
              maintenanceIntervalDays: item.maintenanceIntervalDays,
              nextServiceDue: item.nextServiceDue ? (typeof item.nextServiceDue === 'string' ? item.nextServiceDue : new Date(item.nextServiceDue).toISOString()) : undefined,
              images: Array.isArray(item.images) ? item.images : [],
              metadata: item.metadata,
              createdAt: item.createdAt ? (typeof item.createdAt === 'string' ? item.createdAt : new Date(item.createdAt).toISOString()) : new Date().toISOString(),
              updatedAt: item.updatedAt ? (typeof item.updatedAt === 'string' ? item.updatedAt : new Date(item.updatedAt).toISOString()) : new Date().toISOString(),
              // Legacy fields for backward compatibility
              equipmentType: equipmentType,
              equName: equipmentName,
              equipmentStatus: equipmentStatus,
            };
            
            // Validate required fields
            if (!mapped.equipmentId && !mapped._id) {
              console.error("❌ [fetchAllEquipment] Equipment missing both _id and equipmentId:", item);
              return null;
            }
            
            if (!mapped.name && !mapped.equName) {
              console.warn("⚠️ [fetchAllEquipment] Equipment missing name:", item);
            }
            
            return mapped;
          } catch (error) {
            console.error("❌ [fetchAllEquipment] Error mapping equipment item:", error, item);
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
    // Backend endpoint: POST /equipments
    const response = await axios.post("/equipments", equipment);
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
    // Backend endpoint: PATCH /equipments/:id
    const res = await axios.patch(
      `/equipments/${equipmentId}`,
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
    // Backend endpoint: GET /equipments
    const response = await axios.get("/equipments");

    // Log full response in development
    if (process.env.NODE_ENV === 'development') {
      console.log("📥 [getEquipment] API Response:", JSON.stringify(response.data, null, 2));
    }
    
    // Handle case where response.data might be undefined or null
    if (!response || !response.data) {
      console.error("Invalid response from equipment API");
      return [];
    }

    // Backend returns: { equipments: EquipmentDocument[], total: number, page: number, limit: number }
    // Or wrapped in: { status: "SUCCESS", data: { equipments: [...], total: number, ... } }
    let rawData: any[] = [];
    
    // Try nested structure first: response.data.data.equipments
    if (response.data?.data?.equipments && Array.isArray(response.data.data.equipments)) {
      rawData = response.data.data.equipments;
    } 
    // Fallback to: response.data.equipments
    else if (response.data?.equipments && Array.isArray(response.data.equipments)) {
      rawData = response.data.equipments;
    }
    // Fallback to: response.data.data.data.results (old structure)
    else if (response.data?.data?.data?.results && Array.isArray(response.data.data.data.results)) {
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
            name: item.name || "",
            sku: item.sku,
            type: item.type || EquipmentType.UNKNOWN,
            muscleGroups: Array.isArray(item.muscleGroups) ? item.muscleGroups : [MuscleGroup.UNKNOWN],
            model: item.model || "",
            brand: item.brand || "",
            serialNumber: item.serialNumber,
            location: item.location || { room: undefined, zone: undefined },
            quantityTotal: item.quantityTotal !== undefined && item.quantityTotal !== null ? Number(item.quantityTotal) : 1,
            quantityAvailable: item.quantityAvailable !== undefined && item.quantityAvailable !== null ? Number(item.quantityAvailable) : item.quantityTotal || 1,
            status: item.status || EquipmentStatus.AVAILABLE,
            lastServicedAt: item.lastServicedAt ? (typeof item.lastServicedAt === 'string' ? item.lastServicedAt : new Date(item.lastServicedAt).toISOString()) : undefined,
            maintenanceIntervalDays: item.maintenanceIntervalDays,
            nextServiceDue: item.nextServiceDue ? (typeof item.nextServiceDue === 'string' ? item.nextServiceDue : new Date(item.nextServiceDue).toISOString()) : undefined,
            images: Array.isArray(item.images) ? item.images : [],
            metadata: item.metadata,
            createdAt: item.createdAt ? (typeof item.createdAt === 'string' ? item.createdAt : new Date(item.createdAt).toISOString()) : "",
            updatedAt: item.updatedAt ? (typeof item.updatedAt === 'string' ? item.updatedAt : new Date(item.updatedAt).toISOString()) : "",
            // Legacy fields for backward compatibility
            equipmentType: item.type || EquipmentType.UNKNOWN,
            equName: item.name || "",
            equipmentStatus: item.status || EquipmentStatus.AVAILABLE,
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
    // Backend endpoint: DELETE /equipments/:id
    // Use the _id (MongoDB ObjectId) for deletion
    await axios.delete(`/equipments/${equipmentId}`);
    revalidatePath(`/equipment`);
  } catch (error) {
    console.error("Failed to delete equipment:", error);
    throw error;
  }
}

