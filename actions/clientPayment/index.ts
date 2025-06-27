"use server";
import axios from "@/utils/axios";

export const submitPaymentReal = async (data: { amount: number; reference?: string; clientId: string }) => {
  const response = await axios.post("/payments/collect", data);
  return response.data;
};


interface GroupPaymentData {
  collectedFrom: string;
  amount: number;
  groupId?: string; // Optional if you need to associate with a specific group
}

export const collectGroupPayment = async (data: GroupPaymentData) => {
  try {
    const response = await axios.post("/payments/group", data);
    
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


interface ExtraPaymentData {
  session: string;
  amount: number;
  clientId?: string; // Optional if you need to associate with a client
}

export const collectExtraPayment = async (data: ExtraPaymentData) => {
  try {
    const response = await axios.post("/payments/extra", data);
    
    return {
      status: "SUCCESS",
      data: response.data,
      message: "Extra payment collected successfully"
    };
  } catch (error) {
    console.error("Extra payment error:", error);
    
    // Fallback dummy response for development
    if (process.env.NODE_ENV === "development") {
      console.warn("Using dummy extra payment response");
      return {
        status: "SUCCESS",
        data: {
          id: `ext_${Math.random().toString(36).substring(2, 10)}`,
          ...data,
          timestamp: new Date().toISOString(),
          type: "EXTRA"
        },
        message: "Dummy extra payment processed"
      };
    }
    
    let errorMessage = "Extra payment failed";
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