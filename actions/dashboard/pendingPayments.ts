"use server";
import axios from "@/utils/axios";

export type PendingPaymentCustomer = {
  _id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  packageId: string;
  nic: string;
  addressLine1: string;
  addressLine2: string;
  isMale: boolean;
  isMarried: boolean;
  whyJoin: string;
  profession: string;
  dob: string;
  status: string;
  isActive: boolean;
  isPaid: boolean;
  availableSessionQuota: number;
  isOnFPmachine: boolean;
  deactivateAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type PendingPaymentsResponse = {
  customers: PendingPaymentCustomer[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
};

export const fetchPendingPaymentCustomers = async (
  page: number = 1, 
  size: number = 10,
  searchTerm: string = ""
): Promise<PendingPaymentsResponse> => {
  try {
    // Use the new /customers/expired endpoint
    const res = await axios.get("/customers/expired", {
      params: {
        page,
        size,
        searchTerm: searchTerm.trim() || " "
      }
    });

    console.log("Pending Payments API Response:", JSON.stringify(res.data, null, 2));

    // Try multiple possible paths for the API response
    let results = [];
    let totalRecords = 0;
    
    if (res.data?.data?.data?.results) {
      results = res.data.data.data.results;
      totalRecords = res.data.data.data.totalRecords || res.data.data.data.results.length;
    } else if (res.data?.data?.results) {
      results = res.data.data.results;
      totalRecords = res.data.data.totalRecords || res.data.data.results.length;
    } else if (Array.isArray(res.data?.data)) {
      results = res.data.data;
      totalRecords = res.data.data.length;
    }
    
    console.log("Extracted results:", results.length, "Total records:", totalRecords);
    
    // Map the API response to our type
    const customers: PendingPaymentCustomer[] = results.map((customer: any) => ({
      _id: customer._id,
      clientId: customer.clientId,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      mobileNumber: customer.mobileNumber,
      packageId: customer.packageId,
      nic: customer.nic,
      addressLine1: customer.addressLine1,
      addressLine2: customer.addressLine2,
      isMale: customer.isMale,
      isMarried: customer.isMarried,
      whyJoin: customer.whyJoin,
      profession: customer.profession,
      dob: customer.dob,
      status: customer.status,
      isActive: customer.isActive,
      isPaid: customer.isPaid,
      availableSessionQuota: customer.availableSessionQuota,
      isOnFPmachine: customer.isOnFPmachine,
      deactivateAt: customer.deactivateAt,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    }));
    
    // Use customers.length as fallback if totalRecords is 0
    const actualTotalCount = totalRecords > 0 ? totalRecords : customers.length;
    
    return {
      customers,
      totalCount: actualTotalCount,
      currentPage: page,
      totalPages: Math.ceil(actualTotalCount / size),
    };
  } catch (error) {
    console.error("Failed to fetch pending payment customers:", error);
    
    // Return empty response on error
    return {
      customers: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0,
    };
  }
};

