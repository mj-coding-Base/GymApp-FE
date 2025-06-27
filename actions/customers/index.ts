
"use server";

import { isAxiosError } from "axios";
import axios from "@/utils/axios";
import {
  Customer,
  CustomerView,
  GroupShort,
  GroupFull,
  IndividualCustomer,
} from "@/types/Customer";
import { CommonResponseDataType } from "@/types/Common";
import { revalidatePath } from "next/cache";

interface FetchCustomersParams {
  searchTerm?: string;
  isActive?: boolean;
  customer_type?: string;
  group_id?: string;
  page?: number;
  size?: number;
  ids?: string[];
}

export const fetchIndividualCustomers = async (
  page?: string,
  size?: string,
  searchTerm?: string
): Promise<{ results: IndividualCustomer[]; totalResults: number }> => {
  try {
    const response = await axios.get("/customers/get-all?customer_type=individual", {
      params: { page, size, searchTerm },
    });

    // Correct path based on your response
    const rawData = response.data?.data?.data;
    const results = Array.isArray(rawData?.results) ? rawData.results : [];
    // const resultJSON = rawData.results
    const totalResults = rawData?.totalResults ?? 0;

    console.log("print as ROW JSON:",totalResults);
    console.log("print as array:", results);

    return {
      results,
      totalResults,
    };
  } catch (error) {
    console.error("Error fetching individual customers:", error);
    return { results: [], totalResults: 0 };
  }
};




export const fetchGroups = async (
  page?: string,
  size?: string,
  searchTerm?: string,
  group_id?: string,
  isPrimaryMembersOnly?: boolean
): Promise<{ results: GroupShort[]; totalResults: number }> => {
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
  console.log("API Response:", response.data.data);
      return {
    results: response.data?.data ?? [],
    totalResults: response?.data?.totalResults ?? 0,
  };
  } catch (error) {
    console.error(error);

    return {
      results: [],
      totalResults: 0,
    };
  }
};

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
  console.log("API Response:", response.data.data);
      return {
    results: response.data.data ,
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
    // Ensure we only fetch individual customers
    const res = await axios.get("/admin/customer-management/get-all", {
      params: {
        ...params,
        // Convert array to comma-separated string if needed
        ids: params?.ids?.join(","),
      },
    });

    return {
      data: Array.isArray(res.data?.data) ? res.data.data : [],
      total: res.data?.total,
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

export const getUserById = async (id: string): Promise<CustomerView | null> => {
  try {
    const response = await axios.get(
      `/admin/customer-management/profile-view/${id}`
    );

    console.log(response.data);

    return response.data.data;
  } catch (error) {
    console.error(error);

    return null;
  }
};

// Create a customer
export interface CustomerRegistrationData {
  first_name: string;
  last_name: string;
  email: string;
  nic: string;
  phone: string;
  package_id: string;
  fee: number;
}

export const createIndividualCustomer = async (
  customerData: CustomerRegistrationData
): Promise<CommonResponseDataType> => {
  try {
    const res = await axios.post(
      "/admin/customer-management/individual",
      customerData
    );

    revalidatePath(`/customers`);

    return res.data;
  } catch (error) {
    console.error("Customer creation error:", error);

    return error as CommonResponseDataType;
  }
};

// Update a customer
export const updateCustomer = async (
  customerId: string,
  updatedData: Partial<CustomerRegistrationData>
): Promise<CommonResponseDataType> => {
  try {
    const res = await axios.patch(
      `/admin/customer-management/${customerId}`,
      updatedData
    );

    revalidatePath(`/customers`);

    return res.data;
  } catch (error) {
    console.error(error);

    return error as CommonResponseDataType;
  }
};

// Toggle customer active status
export const toggleCustomerStatus = async (customerId: string) => {
  try {
    const res = await axios.patch(
      `/admin/customer-management/${customerId}/toggleStatus`
    );

    revalidatePath(`/customers`);

    console.log(res.data);

    return res.data;
  } catch (error) {
    console.error(error);

    return error as CommonResponseDataType;
  }
};

// deactivate a customer
export const deactivateCustomer = async (
  customerId: string
): Promise<{ message: string }> => {
  try {
    const res = await axios.patch(
      `/admin/customer-management/${customerId}/toggleStatus`
    );
    return res.data;
  } catch (error) {
    throw new Error(
      isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Failed to delete customer"
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
