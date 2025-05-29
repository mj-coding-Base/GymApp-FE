import { isAxiosError } from "axios";
import axios from "@/utils/axios";
import { Customer,FetchedCustomer,FetchedGroupCustomer, CustomerRegistrationData, CommonResponseDataType  } from "@/types/Customer";
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
  params?: FetchCustomersParams
): Promise<{
  data: FetchedCustomer[];
  total?: number;
}> => {
  try {
    const queryParams = { ...params, customer_type: "individual" }; 
    const res = await axios.get("/admin/customer-management/get-all", {
      params: {
        ...queryParams,
        // Convert array to comma-separated string if needed
        ids: queryParams?.ids?.join(",")
      }
    });
    // const test = await searchCustomers("Manoj")
    // console.log("test search",( test).data)
    return {
      data: Array.isArray(res.data?.data) ? res.data.data : [],
      total: res.data?.total
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

export const fetchGroupCustomers = async (
  params?: FetchCustomersParams
): Promise<{
  data: FetchedGroupCustomer[];
  total?: number;
}> => {
  try {
    const queryParams = { ...params, customer_type: "group" }; 
    const res = await axios.get("/admin/customer-management/get-all", {
      params: {
        ...queryParams,
        // Convert array to comma-separated string if needed
        ids: queryParams?.ids?.join(",")
      }
    });

    return {
      data: Array.isArray(res.data?.data) ? res.data.data : [],
      total: res.data?.total
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

export const fetchAllCustomers = async (
  params?: FetchCustomersParams
): Promise<{
  data: Partial<Customer>[];
  total?: number;
}> => {
  try {// Ensure we only fetch individual customers
    const res = await axios.get("/admin/customer-management/get-all", {
      
      params: {
        ...params,
        // Convert array to comma-separated string if needed
        ids: params?.ids?.join(",")
      }
    });

    return {
      data: Array.isArray(res.data?.data) ? res.data.data : [],
      total: res.data?.total
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

// Update a customer
export const updateCustomer = async (
  customerId: string,
  updatedData: Partial<Customer>
): Promise<Customer> => {
  try {
    const res = await axios.patch(
      `/admin/customer-management/${customerId}`,
      updatedData
    );
    return res.data.data;
  } catch (error) {
    throw new Error(
      isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Failed to update customer"
    );
  }
};

// deactivate a customer
export const deactivateCustomer = async (
  customerId: string
): Promise<{ message: string }> => {
  try {
    const res = await axios.delete(
      `/admin/customer-management/${customerId}`
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

// Toggle customer active status
export const toggleCustomerStatus = async (
  id: string,
  isActive: boolean
): Promise<string> => {
  try {
    const endpoint = `/admin/customer-management/${id}/${
      isActive ? "activate" : "deactivate"
    }`;
    const res = await axios.patch(endpoint);
    return res.data?.message || "Customer status updated successfully.";
  } catch (error) {
    throw new Error(
      isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Failed to update customer status"
    );
  }
};

// Create a customer
export const createIndividualCustomer = async (
  customerData: CustomerRegistrationData
): Promise<string> => { // Returns the created customer ID
  
    console.log("what it get",customerData);
  try {
    // Validate required fields
    const requiredFields: (keyof CustomerRegistrationData)[] = [
      'first_name',
      'last_name',
      'email',
      'nic',
      'phone',
      'package_id',
      'fee'
    ];

    const missingFields = requiredFields.filter(field => !customerData[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    } 
    console.log("what it pass",customerData);

    // Make API request
    const response = await axios.post("/admin/customer-management/individual",customerData,);

    // Handle response
    if (response.data?.status !== 'SUCCESS' || !response.data?.data?.[0]) {
      throw new Error(response.data?.message || 'Customer creation failed');
    }

    return response.data.data[0]; // Return the created customer ID

  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to create customer';
    throw new Error(errorMessage);
  }
};

export const searchCustomers = async (
  searchTerm: string
): Promise<{ data: FetchedCustomer[]; total?: number }> => {
  try {
    const res = await axios.get<CommonResponseDataType<FetchedCustomer[]>>(
      "/admin/customer-management/get-all",
      {
        params: {
          search: searchTerm, 
          customer_type: "individual" 
        }
      }
    );

    return {
      data: Array.isArray(res.data?.data) ? res.data.data : [],
      total: res.data?.data?.length || 0
    };
  } catch (error) {
    console.error("Search error:", error); // Changed from log to error
    throw new Error(
      isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Failed to search customers" // Fixed message to be consistent
    );
  }
};

