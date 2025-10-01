"use server";
import {
    CreateExtraSessionDto,
    CreateSessionDto,
    FetchSessionsParams,
    FindCustomerSessionsDto,
    PTSession,
    SessionsResponse
} from '@/types/SessionHistory';
import axios from "@/utils/axios";
import { isAxiosError } from 'axios'; // Adjust path if needed


export type SessionItem = {
  id: string;
  name: string;
};

const dummyCustomers = [
  {
    id: "1",
    name: "Job Belflore",
    nic: "98123456V",
  },

];

/**
 * Handle API errors consistently
 */
function handleApiError(error: unknown, context: string): never {
  let message = `Failed to ${context}`;

  if (isAxiosError(error)) {
    const status = error.response?.status;
    const responseMessage = error.response?.data?.message || error.message;

    console.error(`❌ AxiosError during ${context}:`);
    console.error("Status Code:", status);
    console.error("Response Message:", responseMessage);
    console.error("Full Response Data:", error.response?.data);

    message = responseMessage;
  } else {
    console.error(`❌ Unknown error during ${context}:`, error);
  }

  throw new Error(message);
}


export const createExtraSession = async (
  token: string,
  data: CreateExtraSessionDto
): Promise<PTSession> => {
  try {
    const res = await axios.post('/sessions/extra', data, );

    return res.data.data;
  } catch (error) {
    handleApiError(error, 'create extra session');
  }
};

/**
 * Create session bundle
 */
export const createSessionBundle = async (
  token: string,
  data: CreateSessionDto
): Promise<PTSession[]> => {
  try {
    const res = await axios.post('/sessions/bundle', data, );

    return res.data.data;
  } catch (error) {
    handleApiError(error, 'create session bundle');
  }
};

/**
 * Get all sessions for a customer
 */
export const findCustomerSessions = async (
  token: string,
  data: FindCustomerSessionsDto
): Promise<PTSession[]> => {
  try {
    const res = await axios.post('/sessions/customer', data, );

    return res.data.data;
  } catch (error) {
    handleApiError(error, 'fetch customer sessions');
  }
};

/**
 * Get all sessions for a trainer
 */
export const findTrainerSessions = async (
): Promise<PTSession[]> => {
  try {
    const res = await axios.get('/sessions/trainer', {
    });

    return res.data.data;
  } catch (error) {
    handleApiError(error, 'fetch trainer sessions');
  }
};

export const getUserAttendance = async (
  customerId: string,
  page = 1,
  size = 50 // or any default
) => {
  try {
    const res = await axios.get(`/Attendances/get-all`, {
      params: {
        page,
        size,
        searchTerm: customerId,
      },
    });

    return res.data.data.customers; // access the array directly
  } catch (error) {
    handleApiError(error, "fetching user attendance is failed");
  }
};

export const getAllSessions2 = async (
  page: number = 1,
  size: number = 10,
  searchTerm?: string
): Promise<{
  status: "SUCCESS" | "FAIL";
  data?: any;
  message?: string;
}> => {
  try {
    const response = await axios.get(
      `sessions/get-all`,
      {
        params: {
          page,
          size,
          ...(searchTerm && { searchTerm }) // Only include searchTerm if it exists
        }
      }
    );
    console.log( "getAllSessions 2 " ,response.data)

    return {
      status: "SUCCESS",
      data: response.data,
      message: "Sessions fetched successfully"
    };
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return {
      status: "FAIL",
      message: "Failed to fetch sessions"
    };
  }
};


export const getAllSessions = async (
  params?: FetchSessionsParams
): Promise<SessionsResponse> => {
  try {
    // Debug: Log the request being made
    if (process.env.NODE_ENV !== 'production') {
      console.log('Making request to fetch sessions with params:', params);
    }

    // ⚡ PERFORMANCE: Ensure params is defined to avoid spreading undefined
    const safeParams = params || {};

    // Prepare query parameters with proper defaults
    const queryParams: Record<string, any> = {
      page: safeParams.page || 1,
      size: safeParams.size || 10,
    };

    // Add optional parameters only if they exist
    if (safeParams.ids && Array.isArray(safeParams.ids) && safeParams.ids.length > 0) {
      queryParams.ids = safeParams.ids.join(',');
    }

    if (safeParams.month && safeParams.month >= 1 && safeParams.month <= 12) {
      queryParams.month = safeParams.month;
    }

    if (safeParams.year && safeParams.year > 2000) {
      queryParams.year = safeParams.year;
    }

    // Add any other parameters from safeParams
    if (safeParams.searchTerm) {
      queryParams.searchTerm = safeParams.searchTerm;
    }

    if (safeParams.trainerId) {
      queryParams.trainerId = safeParams.trainerId;
    }

    if (safeParams.customerId) {
      queryParams.customerId = safeParams.customerId;
    }

    if (safeParams.isAttended !== undefined) {
      queryParams.isAttended = safeParams.isAttended;
    }

    const response = await axios.get('/sessions/get-all', {
      params: queryParams,
    });

    // Debug: Log the full response
    // console.log('Session fetch response:', response);

    if (!response.data) {
      throw new Error('No data received from server');
    }

    if (response.data.status !== 'SUCCESS') {
      throw new Error(response.data.message || 'Request failed');
    }

    return {
      status: 'SUCCESS',
      message: null,
      data: Array.isArray(response.data.data) ? response.data.data : [],
      total: response.data.total
    };

  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Full fetch sessions error:', error);
    }
    
    let errorMessage = 'Failed to fetch sessions';
    
    // Extract error message safely
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.error('Error details:', {
        message: errorMessage,
        stack: error?.stack
      });
    }

    return {
      status: 'FAIL',
      message: errorMessage,
      data: [],
      total: 0
    };
  }
};
export async function markGroupAttendance(sessionIds: string[]): Promise<{
  status: "SUCCESS" | "FAIL";
  message?: string;
}> {
  try {
    await axios.post("/sessions/mark-attendance", {
      sessionIds,
      isAttended: true,
    });
    
    return {
      status: "SUCCESS",
      message: "Attendance marked successfully",
    };
  } catch (error) {
    console.error("Failed to mark attendance:", error);
    return {
      status: "FAIL",
      message: "Failed to mark attendance - using dummy response",
    };
  }
}


export interface Customer {
  id: string;
  name: string;
  nic: string;
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  try {
    const response = await axios.get("/customers/search", {
      params: { query },
    });
    return response.data.map((customer: any) => ({
      id: customer._id,
      name: `${customer.firstName} ${customer.lastName}`,
      nic: customer.nic,
    }));
  } catch (error) {
    console.error("Failed to search customers:", error);
    return dummyCustomers;
  }
}

export async function markIndividualAttendance(data: {
  customerId: string;
  customerName: string;
  trainerId: string;
  trainerName: string;
}): Promise<{
  status: "SUCCESS" | "FAIL";
  message?: string;
}> {
  try {
    await axios.post("/sessions/create",       {
        customerId: data.customerId,
        customerName: data.customerName,
        trainerId: data.trainerId,
        trainerName: data.trainerName
      });
    
    return {
      status: "SUCCESS",
      message: "Attendance marked successfully",
    };
  } catch (error) {
    console.error("Failed to mark attendance:", error);
    return {
      status: "FAIL",
      message: "Failed to mark attendance",
    };
  }
}

/**
 * Delete sessions
 */
export const deleteSessions = async (
  sessionIds: string[]
): Promise<{ deletedCount: number }> => {
  try {
    const res = await axios.delete('/sessions', {data: { sessionIds },});

    return res.data.data;
  } catch (error) {
    handleApiError(error, 'delete sessions');
  }
};




// export async function getGroupSessions(groupId: string): Promise<{
//   sessions: GroupSession[];
//   summary: GroupSessionSummary;
// }> {
//   try {
//     const response = await axios.get(`/groups/${groupId}/sessions`);
//   console.log("");
//     return {
//       sessions: response.data.sessions.map((session: any) => ({
//         id: session._id,
//         date: new Date(session.date).toLocaleDateString('en-GB'),
//         startTime: session.startTime,
//         sessionNumber: session.sessionNumber.toString(),
//         trainerName: session.trainerName,
//       })),
//       summary: {
//         currentMonth: response.data.summary.currentMonth,
//         startDate: new Date(response.data.summary.startDate).toLocaleDateString('en-GB'),
//         today: new Date(response.data.summary.today).toLocaleDateString('en-GB'),
//         currentSession: response.data.summary.currentSession.toString(),
//         clientName: response.data.summary.clientName,
//         paymentStatus: response.data.summary.paymentStatus,
//         extraSessionCount: response.data.summary.extraSessionCount,
//         extraAmountPaid: response.data.summary.extraAmountPaid,
//       }
//     };
//   } catch (error) {
//     console.error("Failed to fetch group sessions:", error);
//     console.log("Using dummy data for group sessions");
//     return {
//       sessions: [
//         { id: "1", date: "20/3/25", startTime: "09:00", sessionNumber: 15, trainerName: "John Doe" },
//         { id: "2", date: "19/3/25", startTime: "09:00", sessionNumber: 12, trainerName: "John Doe" },
//       ],
//       summary: {
//         currentMonth: "Feb",
//         startDate: "01/02/25",
//         today: "03/03/25",
//         currentSession: 11,
//         clientName: "Maria Fernando",
//         paymentStatus: "paid",
//         extraSessionCount: 3,
//         extraAmountPaid: 10000,
//       }
//     };
//   }
// }
// actions/session/getIndividualSessions.ts

// interface GetSessionsParams {
//   clientId?: string;
//   month: number;
//   year: number;
// }

// export async function getIndividualSessions(params: GetSessionsParams) {
//   try {
//     const response = await axios.get("/sessions/individual", {
//       params: {
//         clientId: params.clientId,
//         month: params.month,
//         year: params.year
//       }
//     });
    
//     return {
//       status: "SUCCESS",
//       data: response.data,
//       message: "Sessions fetched successfully"
//     };
//   } catch (error) {
//     console.error("Error fetching sessions:", error);
//     // Fallback dummy data
//     const dummyData: { sessions: Session[] } = {
//       sessions: [
//         {
//           _id: "dummy1",
//           createdAt: new Date().toISOString(),
//           updatedAt: new Date().toISOString(),
//           status: "active",
//           sessionStop: "11:00",
//           customerId: "cust-1",
//           packageId: "pkg-1",
//           isAttended: false,
//           isExtraSession: false,
//           isCancelled: false,
//           sessionCount: 12,
//           trainer: "John Doe",
//           paymentStatus: "NOT_PAID"
//         },
//         {
//           id: "dummy2",
//           _id: "dummy2",
//           createdAt: new Date().toISOString(),
//           updatedAt: new Date().toISOString(),
//           status: "active",
//           sessionDate: "2023-11-22",
//           sessionStart: "09:00",
//           sessionStop: "10:00",
//           customerId: "cust-2",
//           packageId: "pkg-2",
//           isAttended: false,
//           isExtraSession: false,
//           isCancelled: false,
//           sessionCount: 2,
//           trainer: "John Doe",
//           paymentStatus: "PENDING"
//         },
//         {
//           id: "dummy3",
//           _id: "dummy3",
//           createdAt: new Date().toISOString(),
//           updatedAt: new Date().toISOString(),
//           status: "active",
//           sessionDate: "2023-11-29",
//           sessionStart: "10:00",
//           sessionStop: "11:00",
//           customerId: "cust-3",
//           packageId: "pkg-3",
//           isAttended: false,
//           isExtraSession: false,
//           isCancelled: false,
//           sessionCount: 3,
//           trainer: "John Doe",
//           paymentStatus: "PAID"
//         }
//       ]
//     };

//     let errorMessage = "Failed to fetch sessions (using dummy data)";
//     if (error && typeof error === "object" && "response" in error && error.response) {
//       errorMessage = (error.response as any)?.data?.message || errorMessage;
//     }

//     return {
//       status: "FAIL",
//       message: errorMessage,
//       data: dummyData // Return dummy data on failure
//     };
//   }
// }

export async function fetchCustomers() {
  try {
    const response = await axios.get("/customers");
    return {
      groups: response.data.groups || [],
      individuals: response.data.individuals || [],
      status: "SUCCESS"
    };
  } catch (error) {
    console.error("Error fetching customers:", error);
    return {
      groups: [],
      individuals: [],
      status: "FAIL",
      message: (error && typeof error === "object" && "response" in error && (error as any).response?.data?.message)
        ? (error as any).response.data.message
        : "Failed to fetch customers"
    };
  }
}