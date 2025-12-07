
"use server";

import { CommonResponseDataType } from "@/types/Common";
import {
  Customer,
  GroupCustomer,
  GroupFull,
  GroupShort,
  IndividualCustomer,
  PaymentHistory,
} from "@/types/Customer";
import axios from "@/utils/axios";
import { getGymIdFromToken } from "@/utils/jwt";
import { deduplicatedRequest } from "@/utils/requestDeduplication";
import { isAxiosError } from "axios";
import { revalidatePath } from "next/cache";
const cacheBuster = Date.now();

interface FetchCustomersParams {
  searchTerm?: string;
  isActive?: boolean;
  customer_type?: string;
  group_id?: string;
  page?: number;
  size?: number;
  ids?: string[];
}

// ⚡ PERFORMANCE OPTIMIZATION: Deduplicated fetch for individual customers
// 🔒 SECURITY: Uses x-auth-token header (set by axios interceptor) - never sends gym-id header
export async function fetchIndividualCustomers(
  page?: string,
  size?: string,
  searchTerm?: string
): Promise<{ results: IndividualCustomer[]; totalResults: number }> {
  const cacheKey = `customers-individual-${page || "1"}-${size || "10"}-${searchTerm || ""}`;

  return deduplicatedRequest(cacheKey, async () => {
    try {
      // SECURITY: Axios interceptor automatically adds x-auth-token header from session
      // The backend extracts gymId from the JWT token, not from headers
      // This prevents cross-gym data leakage
      const response = await axios.get("/customers/get-all", {
        params: {
          page: page || "1",
          size: size || "10",
          searchTerm: searchTerm || undefined,
          _: cacheBuster,
        },
        // Note: gym-id header is NOT sent - backend uses gymId from JWT token
      });

      // Response structure after ApiResponseInterceptor:
      // { status: 'SUCCESS', message: null, data: { data: { results: [...], totalResults: 123 } } }
      const serverPayload = response?.data;
      
      // Extract the nested data structure
      // serverPayload.data = { data: { results, totalResults } }
      // serverPayload.data.data = { results, totalResults }
      const inner = serverPayload?.data?.data ?? serverPayload?.data ?? null;

      const results = Array.isArray(inner?.results) ? inner.results : [];
      const totalResults = Number(inner?.totalResults) || 0;

      // If no results found in development, log structure for debugging
      if (process.env.NODE_ENV !== 'production') {
        if (!results.length && totalResults === 0) {
          console.warn("No data returned. Full response structure:", {
            hasResponse: !!response,
            hasData: !!response?.data,
            responseData: response?.data,
            inner: inner,
            resultsLength: results.length,
            totalResults: totalResults
          });
        } else {
          console.log("Successfully fetched customers:", {
            resultsCount: results.length,
            totalResults: totalResults
          });
        }
      }

      return {
        results,
        totalResults,
      };
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Error fetching individual customers:", error);
      }
      return { results: [], totalResults: 0 };
    }
  });
}




// ⚡ PERFORMANCE OPTIMIZATION: Deduplicated fetch for groups
export async function fetchGroups(
  page?: string,
  size?: string,
  searchTerm?: string,
  group_id?: string,
  isPrimaryMembersOnly?: boolean
): Promise<{ results: GroupShort[]; totalResults: number }> {
  const cacheKey = `customers-groups-${page || ""}-${size || ""}-${searchTerm || ""}-${group_id || ""}-${isPrimaryMembersOnly || false}`;
  
  return deduplicatedRequest(cacheKey, async () => {
    try {
      const response = await axios.get("/api/groups",
        {
          params: {
            page: page || "1",
            size: size || "10",
            searchTerm: searchTerm ?? " ",
          },
        }
      );
      
      // Handle new API response structure
      // Response structure: { status, message, data: { total, page, size, groups: [...] } }
      let results: GroupShort[] = [];
      let totalResults = 0;
      
      if (response.data?.data?.groups && Array.isArray(response.data.data.groups)) {
        const groups = response.data.data.groups;
        totalResults = response.data.data.total || groups.length;
        
        // Transform API response to GroupShort format
        results = groups.map((group: any) => {
          // Find primary member from members array
          const primaryMember = group.members?.find((m: any) => m.relationship === "primary");
          const primaryMemberName = primaryMember?.name || "N/A";
          
          // Get package_name from primary member's packageId or use "N/A"
          // Note: package_name might need to be fetched separately, using packageId for now
          const package_name = primaryMember?.packageId || "N/A";
          
          return {
            _id: group.groupId,
            groupId: group.groupId,
            createdAt: group.createdAt,
            status: group.status || "ACTIVE",
            primaryMember: primaryMemberName,
            number_of_members: group.members?.length || 0,
            package_name: package_name,
          };
        });
      }
      
      return {
        results,
        totalResults,
      };
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Error fetching groups:", error);
      }
      return {
        results: [],
        totalResults: 0,
      };
    }
  });
}

export const fetchGroupCustomers = async (
  page?: string,
  size?: string,
  searchTerm?: string,
  group_id?: string,
  isPrimaryMembersOnly?: boolean
): Promise<{ results: GroupFull }> => {
  try {
    // Fetch all groups and find the specific group by group_id
    const response = await axios.get("/api/groups",
      {
        params: {
          page: page || "1",
          size: size || "1000", // Large size to get all groups if needed
          searchTerm: searchTerm ?? " ",
        },
      }
    );
    
    if (response.data?.data?.groups && Array.isArray(response.data.data.groups)) {
      // Find the specific group by group_id
      const group = response.data.data.groups.find((g: any) => g.groupId === group_id);
      
      if (group) {
        // Find primary member
        const primaryMember = group.members?.find((m: any) => m.relationship === "primary");
        const primaryMemberName = primaryMember?.name || "N/A";
        const package_name = primaryMember?.packageId || "N/A";
        
        // Transform API members to GroupCustomer format
        // Note: The API only provides limited member data, so we'll map what's available
        const members: GroupCustomer[] = (group.members || []).map((member: any) => ({
          _id: member.id,
          createdAt: group.createdAt, // Use group creation date as fallback
          updatedAt: group.createdAt,
          status: group.status,
          firstName: member.name.split(' ')[0] || '',
          lastName: member.name.split(' ').slice(1).join(' ') || '',
          email: '',
          nic: '',
          mobileNumber: '',
          relationToPrimaryMember: member.relationship === "primary" ? "Primary Member" : member.relationship,
          isPrimaryMember: member.relationship === "primary",
          packageId: member.packageId,
          fee: 0,
          isActive: group.status === "ACTIVE",
          isPaid: false,
          group_id: group.groupId,
          number_of_members: group.members?.length || 0,
          package_name: package_name,
          availableSessionQuota: 0,
          clientId: member.clientId,
          groupId: group.groupId,
        }));
        
        const groupFull: GroupFull = {
          _id: group.groupId,
          groupId: group.groupId,
          createdAt: group.createdAt,
          status: group.status || "ACTIVE",
          primaryMember: primaryMemberName,
          number_of_members: group.members?.length || 0,
          package_name: package_name,
          members: members,
        };
        
        return {
          results: groupFull,
        };
      }
    }
    
    return {
      results: {} as GroupFull,
    };
  } catch (error) {
    console.error(error);
    return {
      results: {} as GroupFull,
    };
  }
};

export const fetchAllCustomers = async (
  params?: FetchCustomersParams
): Promise<{
  data: Partial<Customer>[];
  total?: number;
}> => {
  try {
    // Filter out undefined values to avoid sending null/undefined in query params
    const safeParams: Record<string, any> = {};

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'ids' && Array.isArray(value)) {
            // Convert array of IDs to comma-separated string
            safeParams[key] = value.join(',');
          } else {
            safeParams[key] = value;
          }
        }
      });
    }

    // 🔒 SECURITY: Use /customers/get-all endpoint (backend controller is @Controller('customers'))
    // Multi-tenant isolation is enforced via JWT token (gymId extracted from token)
    const res = await axios.get("/customers/get-all", {
      params: safeParams,
    });
    console.log(res.data?.data);
    return {
      data: Array.isArray(res.data?.data) ? res.data.data : [],
      total: res.data?.total || 0,
    };
  } catch (error) {
    console.error("Fetch customers error:", error);
    throw new Error(
      isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Failed to fetch customers"
    );
  }
};

export const getUserPaymentsId = async (id: string): Promise<PaymentHistory[] | null> => {
  try {
    const response = await axios.get(
      `/clientsPayment/userPayments/${id}`
    );

    return response.data.data;
  } catch (error: any) {
    // Handle "no payments" as a valid case, not an error
    const errorMessage = error?.response?.data?.message || error?.message || '';
    
    if (errorMessage.includes("hasn't made any payments") || 
        errorMessage.includes("no payments")) {
      // This is expected - user simply has no payment history yet
      if (process.env.NODE_ENV !== 'production') {
        console.log(`User ${id} has no payment history yet`);
      }
      return [];
    }
    
    // Log actual errors
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching user payments:', errorMessage);
    }

    return null;
  }
};

// Create a customer
export interface CustomerRegistrationData {
  firstName: string;
  lastName: string;
  addressLine1 :  string ,
  addressLine2 :  string ,
  email: string;
  nic: string;
  mobileNumber: string;
  packageId: string;
  whyJoin: string;
  profession: string;
  dob: string;
  isMale : boolean,
  deactivateAt: string;
  reference?: string;
  clientId?: string;
}

export const createIndividualCustomer = async (
  NewIndividualCustomer: CustomerRegistrationData
): Promise<CommonResponseDataType> => {
  try {
    const res = await axios.post(
      "/customers/add-customer",
      NewIndividualCustomer
    );

    revalidatePath(`/customers`);

    return res.data;
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("Customer creation error:", error);
    }
    
    // Return proper error response
    const errorMessage = error?.response?.data?.message || error?.message || "Failed to create customer";
    return {
      status: 'FAIL',
      message: errorMessage,
      data: null
    };
  }
};

// Update a customer
export const updateCustomer = async (
  customerId: string,
  updatedData: Partial<CustomerRegistrationData>
): Promise<CommonResponseDataType> => {
  console.log("Customer hoding ID "+customerId+" is updated");
  try {
    // Remove clientId from update data as it's auto-generated and read-only
    const { clientId, ...dataToSend } = updatedData as any;
    
    const res = await axios.patch(
      `/customers/${customerId}`,
      dataToSend
    );

    revalidatePath(`/customers`);

    return res.data;
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("Update customer error:", error);
    }
    
    // Return proper error response
    const errorMessage = error?.response?.data?.message || error?.message || "Failed to update customer";
    return {
      status: 'FAIL',
      message: errorMessage,
      data: null
    };
  }
};

// Toggle customer active status
// NOTE: Backend only has /customers/:id/deactivate endpoint, not toggleStatus
// This function deactivates the customer (backend doesn't have activate endpoint)
export const toggleCustomerStatus = async (customerId: string) => {
  try {
    // 🔒 SECURITY: Use /customers/:id/deactivate endpoint (backend controller is @Controller('customers'))
    // Multi-tenant isolation is enforced via JWT token (gymId extracted from token)
    await axios.patch(
      `/customers/${customerId}/deactivate`
    );

    revalidatePath(`/customers`);

    return "successfully deactivated";
  } catch (error) {
    console.error(error);

    return error as CommonResponseDataType;
  }
};

// deactivate a customer
export const deactivateCustomer = async (
  customerId: string
): Promise<CommonResponseDataType> => {
  try {
    const res = await axios.patch(
      `/customers/${customerId}/deactivate`
    );

    return {
      status: 'SUCCESS',
      message: 'Customer deactivated',
      data: res.data.data, // or res.data if needed
    };
  } catch (error) {
    throw new Error(
      isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Failed to deactivate customer"
    );
  }
};



export const searchCustomers = async (
  searchTerm: string
): Promise<Customer[]> => {
  try {
    // 🔒 SECURITY: Use /customers/get-all endpoint (backend controller is @Controller('customers'))
    // Multi-tenant isolation is enforced via JWT token (gymId extracted from token)
    const response = await axios.get("/customers/get-all", {
      params: {
        searchTerm,
      },
    });

    return Array.isArray(response.data?.data) ? response.data.data : [];
  } catch (error) {
    console.error("Search error:", error);
    throw new Error(
      isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Failed to search customers"
    );
  }
};

/**
 * Upload customer profile picture
 * @param clientId - Customer clientId
 * @param file - File object from file input
 * @returns Promise with upload result
 * 
 * NOTE: Profile picture functionality is temporarily disabled
 */
export const uploadProfilePicture = async (
  clientId: string,
  file: File
): Promise<{ success: boolean; message: string; filePath?: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file); // Field name must match backend: FileInterceptor('file')

    const response = await axios.post<{
      message: string;
      filename: string;
      filePath: string;
    }>(`/customers/${clientId}/upload-profile-picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: true,
      message: response.data.message,
      filePath: response.data.filePath,
    };
  } catch (error) {
    console.error('Profile picture upload failed:', error);
    throw new Error(
      isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Failed to upload profile picture"
    );
  }
};

/**
 * Get profile picture URL (returns blob URL for <img src>)
 * @param clientId - Customer clientId
 * @returns Promise resolving to blob URL string or null if not found
 */
export const getProfilePictureUrl = async (clientId: string, gymId?: string): Promise<string | null> => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[getProfilePictureUrl] Requesting profile picture for clientId: ${clientId}`);
    }
    
    // Use fetch API directly for binary data to avoid axios interceptor issues
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.payzhe.fit/api/v1";
    const isServer = globalThis.window === undefined;
    const token = isServer ? null : localStorage.getItem('x-auth-token');
    
    // 🔒 SECURITY: Extract gymId from token if not provided
    // This ensures tenant isolation for profile picture access
    let finalGymId: string | null | undefined = gymId;
    if (!finalGymId && token && !isServer) {
      // Only extract from token on client-side (localStorage not available on server)
      finalGymId = getGymIdFromToken(token);
    }
    
    // Build URL with gym-id query parameter for tenant isolation
    let url = `${BASE_URL}/customers/${clientId}/profile-picture`;
    if (finalGymId) {
      url += `?gym-id=${encodeURIComponent(finalGymId)}`;
    }
    
    const headers: HeadersInit = {};
    if (token) {
      headers['x-auth-token'] = token;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[getProfilePictureUrl] Profile picture not found (404) for clientId: ${clientId}`);
        }
        return null;
      }
      if (response.status === 400) {
        // Missing or invalid gym-id
        const errorData = await response.json().catch(() => ({}));
        if (process.env.NODE_ENV !== 'production') {
          console.error(`[getProfilePictureUrl] Bad request (400): Missing gym-id for clientId: ${clientId}`, errorData);
        }
        return null;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[getProfilePictureUrl] Response received:`, {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        ok: response.ok,
      });
    }

    // Get the blob directly from fetch response
    const blob = await response.blob();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    if (blob.size === 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[getProfilePictureUrl] Empty blob created for clientId: ${clientId}`);
      }
      return null;
    }

    const objectUrl = URL.createObjectURL(blob);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[getProfilePictureUrl] ✅ Successfully created blob URL for clientId: ${clientId}`, {
        blobSize: blob.size,
        contentType: contentType,
        objectUrl: objectUrl.substring(0, 50) + '...',
      });
    }
    
    return objectUrl;
  } catch (error) {
    // Return null if profile picture not found (404) - this is expected for customers without pictures
    const is404 = error instanceof Error && (
      error.message.includes('404') || 
      error.message.includes('not found') ||
      error.message.includes('Cannot GET')
    );
    
    if (is404) {
      // Log 404 for debugging
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[getProfilePictureUrl] Profile picture not found (404) for clientId: ${clientId}`);
      }
      return null;
    }
    
    // Log non-404 errors with full details
    console.error(`[getProfilePictureUrl] ❌ Failed to get profile picture for clientId: ${clientId}:`, error);
    if (error instanceof Error) {
      console.error('[getProfilePictureUrl] Error message:', error.message);
      console.error('[getProfilePictureUrl] Error stack:', error.stack);
    }
    return null;
  }
};

/**
 * Get customer by clientId
 * @param clientId - Customer clientId
 * @returns Promise with customer data
 */
export const getCustomerByClientId = async (
  clientId: string
): Promise<IndividualCustomer | null> => {
  try {
    const response = await axios.get(`/customers/${clientId}`);
    const data = response.data?.data || response.data;
    return data as IndividualCustomer | null;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("Error fetching customer by clientId:", error);
    }
    return null;
  }
};

/**
 * Reset FP machine status and last payment access given for a single customer
 * @param customerId - Customer clientId
 * @returns Promise with reset result
 */
export const resetFpMachineStatusSingle = async (
  customerId: string
): Promise<CommonResponseDataType> => {
  try {
    const response = await axios.post<{
      success: boolean;
      message: string;
      result: {
        success: boolean;
        gymId: string;
        clientId: string;
        customerUpdated: boolean;
        paymentUpdated: boolean;
        durationMs: number;
      };
    }>("/customers/reset-fp-machine-status-single", {
      customerId,
    });

    // Transform API response to CommonResponseDataType format
    if (response.data.success) {
      return {
        status: 'SUCCESS',
        message: response.data.message || 'FP machine status reset completed successfully',
        data: response.data.result,
      };
    } else {
      return {
        status: 'FAIL',
        message: response.data.message || 'Failed to reset FP machine status',
        data: null,
      };
    }
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("Reset FP machine status error:", error);
    }
    
    // Handle 404 and 500 errors as specified in API docs
    const status = isAxiosError(error) ? error.response?.status : null;
    let errorMessage = "Failed to reset FP machine status";
    
    if (status === 404) {
      errorMessage = "Customer not found";
    } else if (status === 500) {
      errorMessage = "Failed to reset FP machine status";
    } else {
      errorMessage = error?.response?.data?.message || error?.message || errorMessage;
    }
    
    return {
      status: 'FAIL',
      message: errorMessage,
      data: null,
    };
  }
};