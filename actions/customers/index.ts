
"use server";

import { CommonResponseDataType } from "@/types/Common";
import {
  Customer,
  GroupFull,
  GroupShort,
  IndividualCustomer,
  PaymentHistory,
} from "@/types/Customer";
import axios from "@/utils/axios";
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
export async function fetchIndividualCustomers(
  page?: string,
  size?: string,
  searchTerm?: string
): Promise<{ results: IndividualCustomer[]; totalResults: number }> {
  const cacheKey = `customers-individual-${page || "1"}-${size || "10"}-${searchTerm || ""}`;
  
  return deduplicatedRequest(cacheKey, async () => {
    try {
      const response = await axios.get("/customers/get-all", {
        params: {
          page: page || "1",
          size: size || "10",
          searchTerm: searchTerm || undefined,
          _: cacheBuster,
        },
      });

      // Safely extract results
      const results = response.data?.data?.data?.results;
      // Safely ex  tract totalResults
      console.log(response.data?.data?.data?.totalResults);
      const totalResults = parseInt(response.data?.data?.data?.totalResults, 10) || 0;

      // If no results found in development, log structure
      if (process.env.NODE_ENV !== 'production' && !results.length && totalResults === 0) {
        console.warn("No data returned. Full response:", response.data);
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
      const response = await axios.get("/customers/get-all?customer_type=group",
        {
          params: {
            page,
            size,
            searchTerm,
            group_id,
            isPrimaryMembersOnly,
          },
        }
      );
            
      return {
        results: response.data?.data ?? [],
        totalResults: response?.data?.totalResults ?? 0,
      };
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(error);
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
    const response = await axios.get("/customers/get-all?customer_type=group",
      {
        params: {
          page,
          size,
          searchTerm,
          group_id,
          isPrimaryMembersOnly,
        },
      }
    );
    console.log(response.data.data);
    return {
      results: response.data.data,
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

    const res = await axios.get("/admin/customer-management/get-all", {
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
  isMarried : boolean,
  deactivateAt: string;
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
export const toggleCustomerStatus = async (customerId: string) => {
  try {
    await axios.patch(
      `/admin/customer-management/${customerId}/toggleStatus`
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
    const response = await axios.get("/admin/customer-management/get-all", {
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
