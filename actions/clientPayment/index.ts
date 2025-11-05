"use server";
import axios from "@/utils/axios";

export const collectIndividualPayment = async (data: { amount: number; reference?: string; paidFor: string }) => {
  const response = await axios.post("/clientsPayment/create", data);
  return response.data;
};


interface GroupPaymentData {
  collectedFrom: string;
  amount: number;
  groupId?: string; // Optional if you need to associate with a specific group
}

export const collectGroupPayment = async (data: GroupPaymentData) => {
  try {
    const response = await axios.post("/clientsPayment/createPayment", data);
    
    return {
      status: "SUCCESS",
      data: response.data,
      message: "Payment collected successfully"
    };
  } catch (error) {
    console.error("Payment collection error:", error);
    
    // Fallback dummy response for development
    if (process.env.NODE_ENV === "development") {
      console.warn("Using dummy payment response");
      return {
        status: "SUCCESS",
        data: {
          id: `pmt_${Math.random().toString(36).substring(2, 10)}`,
          ...data,
          timestamp: new Date().toISOString()
        },
        message: "Dummy payment processed"
      };
    }
    
    let errorMessage = "Payment collection failed";
    if (typeof error === "object" && error !== null && "response" in error) {
      const err = error as { response?: { data?: { message?: string } } };
      errorMessage = err.response?.data?.message || errorMessage;
    }
    return {
      status: "FAIL",
      message: errorMessage,
      data: null
    };
  }
};


export const collectExtraPayment = async (data: { paidFor: string ; amount: number; sessionQuota?: number; }) => {
  const response = await axios.post("/clientsPayment/createExtra", data);
  return response.data;
};


interface GroupPaymentDetailsParams {
  groupId?: string;
  month: number;
  year: number;
}

export const fetchGroupPaymentDetails = async (params: GroupPaymentDetailsParams) => {
  try {
    const response = await axios.get("/payments/group-details", {
      params: {
        month: params.month,
        year: params.year
      }
    });
    
    return {
      status: "SUCCESS",
      data: response.data,
      message: "Group payment details fetched successfully"
    };
  } catch (error) {
    console.error("Error fetching group payment details:", error);
    
    // Fallback dummy data for development
    if (process.env.NODE_ENV === "development") {
      console.warn("Using dummy group payment data");
      return {
        status: "SUCCESS",
        data: {
          members: [
            {
              id: "1",
              name: "Raj Ayesh",
              nic: "1234567890",
              currentSession: 11,
              paymentStatus: "PAID",
              lastPaymentDate: new Date().toISOString()
            },
            {
              id: "2",
              name: "Priya Sharma",
              nic: "9876543210",
              currentSession: 8,
              paymentStatus: "PENDING",
              lastPaymentDate: new Date(Date.now() - 86400000 * 5).toISOString()
            },
            {
              id: "3",
              name: "Amit Patel",
              nic: "4567891230",
              currentSession: 12,
              paymentStatus: "OVERDUE",
              lastPaymentDate: new Date(Date.now() - 86400000 * 30).toISOString()
            }
          ]
        },
        message: "Dummy data loaded"
      };
    }
    
    let errorMessage = "Failed to fetch group payment details";
    if (typeof error === "object" && error !== null && "response" in error) {
      const err = error as { response?: { data?: { message?: string } } };
      errorMessage = err.response?.data?.message || errorMessage;
    }
    return {
      status: "FAIL",
      message: errorMessage,
      data: null
    };
  }
}

export interface FetchPaymentsFilters {
  page?: number;
  size?: number;
  searchTerm?: string;
  paymentId?: string;
  paidFor?: string;
  paidBy?: string;
  month?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
  accessgiven?: boolean;
  isExtra?: boolean;
}

export interface PaymentResponse {
  _id: string;
  amount: number;
  reference: string;
  month: string;
  paidFor: string;
  paymentId: string;
  paidBy: string;
  gymId: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  isExtra: boolean;
  accessgiven: boolean;
}

export interface FetchPaymentsResult {
  payments: PaymentResponse[];
  totalCount: number;
  totalAmount?: number;
  page: number;
  size: number;
  totalPages: number;
}

export const fetchAllPayments = async (filters: FetchPaymentsFilters): Promise<FetchPaymentsResult> => {
  try {
    const params: Record<string, any> = {};
    
    // Only add defined filters to params
    if (filters.page !== undefined) params.page = filters.page;
    if (filters.size !== undefined) params.size = filters.size;
    if (filters.searchTerm) params.searchTerm = filters.searchTerm;
    if (filters.paymentId) params.paymentId = filters.paymentId;
    if (filters.paidFor) params.paidFor = filters.paidFor;
    if (filters.paidBy) params.paidBy = filters.paidBy;
    if (filters.month) params.month = filters.month;
    if (filters.minAmount !== undefined) params.minAmount = filters.minAmount;
    if (filters.maxAmount !== undefined) params.maxAmount = filters.maxAmount;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;
    if (filters.accessgiven !== undefined) params.accessgiven = filters.accessgiven;
    if (filters.isExtra !== undefined) params.isExtra = filters.isExtra;

    const response = await axios.get("/clientsPayment/get-all", { params });
    
    return {
      payments: response.data?.data?.payments || [],
      totalCount: response.data?.data?.totalCount || 0,
      totalAmount: response.data?.data?.totalAmount || 0,
      page: response.data?.data?.page || 1,
      size: response.data?.data?.size || 10,
      totalPages: response.data?.data?.totalPages || 0,
    };
  } catch (error) {
    console.error("Error fetching payments:", error);
    return {
      payments: [],
      totalCount: 0,
      totalAmount: 0,
      page: 1,
      size: 10,
      totalPages: 0,
    };
  }
};