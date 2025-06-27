"use server";
import  { isAxiosError } from 'axios'; // Adjust path if needed
import {
  CreateExtraSessionDto,
  CreateSessionDto,
  FindCustomerSessionsDto,
  Session,
  FetchSessionsParams, SessionsResponse
} from '@/types/SessionHistory';
import axios from "@/utils/axios";


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
  {
    id: "2",
    name: "Jane Smith",
    nic: "98123457V",
  },
  {
    id: "3",
    name: "Alan Cooper",
    nic: "98123458V",
  },
  {
    id: "4",
    name: "Maria Gomez",
    nic: "98123459V",
  },
  {
    id: "5",
    name: "Liam Johnson",
    nic: "98123460V",
  },
  {
    id: "6",
    name: "Chloe Brown",
    nic: "98123461V",
  },
  {
    id: "7",
    name: "Noah Wilson",
    nic: "98123462V",
  },
  {
    id: "8",
    name: "Emma Davis",
    nic: "98123463V",
  },
  {
    id: "9",
    name: "Mason Lee",
    nic: "98123464V",
  },
  {
    id: "10",
    name: "Olivia Martin",
    nic: "98123465V",
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
): Promise<Session> => {
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
): Promise<Session[]> => {
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
): Promise<Session[]> => {
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
): Promise<Session[]> => {
  try {
    const res = await axios.get('/sessions/trainer', {
    });

    return res.data.data;
  } catch (error) {
    handleApiError(error, 'fetch trainer sessions');
  }
};



export const getAllSessions = async (
  params?: FetchSessionsParams
): Promise<SessionsResponse> => {
  try {
    // Debug: Log the request being made
    console.log('Making request to fetch sessions with params:', params);

    // Prepare query parameters
    const queryParams: Record<string, any> = {
      ...params,
      ids: params?.ids?.join(','),
      month: params?.month && params.month >= 1 && params.month <= 12 
        ? params.month 
        : undefined,
      year: params?.year && params.year > 2000 
        ? params.year 
        : undefined
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    // Debug: Log the final query params
    console.log('Final query params:', queryParams);

    const response = 
    await axios.get('/admin/session-management',
      {
        params: queryParams,
      }
    );

    // Debug: Log the full response
    console.log('Session fetch response:', response);

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
    console.error('Full fetch sessions error:', error);
    
    let errorMessage = 'Failed to fetch sessions';
    let responseData = null;



    console.error('Error details:', {
      message: errorMessage,
      response: responseData,
      stack: error.stack
    });

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

export async function markMultipleAttendances(
  customerIds: string[]
): Promise<{
  status: "SUCCESS" | "FAIL";
  message?: string;
}> {
  try {
    await axios.post("/attendance/mark-multiple", {
      customerIds,
    });
    
    return {
      status: "SUCCESS",
      message: `${customerIds.length} attendance(s) marked successfully`,
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

interface GetSessionsParams {
  clientId?: string;
  month: number;
  year: number;
}

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