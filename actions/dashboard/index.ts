"use server";
import axios from "@/utils/axios";
import { deduplicatedRequest } from "@/utils/requestDeduplication";
import { format } from "date-fns";

export type DashboardData = {
  trainer: {
    partTime: number;
    fullTime: number;
  };
  client: {
    group: number;
    individual: number;
    pendingPayments: number;
  };
  paymentHistory: Array<{
    month: string;
    amount: number;
  }>;
};

// ⚡ PERFORMANCE OPTIMIZATION: Deduplicate dashboard requests
export const fetchDashboardData = async (): Promise<DashboardData> => {
  return deduplicatedRequest('dashboard-data', async () => {
    try {
      const res = await axios.get("/admin/admin-management/dashboard");
      const apiData = res.data.data;
      console.log("Dashboard API Response:", apiData);
      
      // Transform paymentHistory from object to array
      let paymentHistory: Array<{ month: string; amount: number }> = [];
      
      if (apiData?.paymentHistory) {
        if (Array.isArray(apiData.paymentHistory)) {
          // Already an array
          paymentHistory = apiData.paymentHistory;
        } else if (typeof apiData.paymentHistory === 'object') {
          // Convert object to array and filter out empty months
          paymentHistory = Object.values(apiData.paymentHistory)
            .filter((item: any) => item?.month && item.month.trim() !== '')
            .map((item: any) => ({
              month: item.month,
              amount: item.amount || 0
            }));
        }
      }
      
      return {
        ...apiData,
        paymentHistory
      };
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("API request failed. Returning dummy data.", error);
      }

    // Dummy fallback data
    const dummyData: DashboardData = {
      trainer: {
        partTime: 0,
        fullTime: 0,
      },
      client: {
        group: 0,
        individual: 0,
        pendingPayments: 0,
      },
      paymentHistory: [
        { month: "January", amount: 0 },
        { month: "February", amount: 0 },
        { month: "March", amount: 0 },
        { month: "April", amount: 0 },
        { month: "May", amount: 0 },
        { month: "June", amount: 0 },
      ],
    };

      return dummyData;
    }
  });
};

// Types for daily attendance data
export type DailyAttendanceData = {
  date: string;
  attendances: Array<{
    customerId: string;
    firstName: string;
    lastName: string;
    time: string;
    attendedDateTime: string;
  }>;
  totalCount: number;
};

// API Response structure
type DailyAttendanceApiResponse = {
  status: string;
  message: string | null;
  data: {
    success: boolean;
    message: string;
    data: DailyAttendanceData[];
    totalRecords: number;
    dateRange: {
      startDate: string;
      endDate: string;
    };
  };
};

export const fetchDailyAttendance = async (
  startDate: string,
  endDate: string
): Promise<DailyAttendanceData[]> => {
  try {
    // SECURITY FIX: Removed hardcoded 'gym-id' header
    // The axios interceptor will automatically set the correct gym-id from JWT token
    // This prevents hardcoded gym-id which was a CRITICAL security vulnerability
    const res = await axios.get(
      `/Attendances/daily-attendance?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          'accept': 'application/json',
          // gym-id header is automatically set by axios interceptor from JWT token
        }
      }
    );
    
    // Handle the nested response structure
    const apiResponse: DailyAttendanceApiResponse = res.data;
    return apiResponse.data.data;
  } catch (error: any) {
    // Handle 502 Bad Gateway errors gracefully
    if (error?.response?.status === 502) {
      console.warn(
        "Backend service unavailable (502) for daily attendance. " +
        "This may indicate the backend is starting up or temporarily unavailable."
      );
    } else {
      console.error("Failed to fetch daily attendance data:", error);
    }
    
    // Return dummy data for development
    const dummyData: DailyAttendanceData[] = [
      {
        date: "2024-01-15",
        attendances: [
          {
            customerId: "CUST001",
            firstName: "User",
            lastName: "01",
            time: "08:30 AM",
            attendedDateTime: "2024-01-15T08:30:00"
          },
          {
            customerId: "CUST002", 
            firstName: "User",
            lastName: "02",
            time: "09:15 AM",
            attendedDateTime: "2024-01-15T09:15:00"
          }
        ],
        totalCount: 2
      },
      {
        date: "2024-01-16",
        attendances: [
          {
            customerId: "CUST003",
            firstName: "User",
            lastName: "03",
            time: "07:45 AM",
            attendedDateTime: "2024-01-16T07:45:00"
          }
        ],
        totalCount: 1
      }
    ];
    
    return dummyData;
  }
};

// Type for today's attendance records
export type TodayAttendanceRecord = {
  _id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  attendedDateTime: string;
  deactivateAt?: string;
  clientId?: string;
  reference?: string;
};

// API Response structure for today's attendance
type TodayAttendanceApiResponse = {
  status: string;
  message: string | null;
  data: {
    success: boolean;
    message: string;
    data: Array<{
      date: string;
      attendances: Array<{
        _id?: string;
        customerId: string;
        firstName: string;
        lastName: string;
        time: string;
        attendedDateTime: string;
        deactivateAt?: string;
        clientId?: string;
        reference?: string;
      }>;
      totalCount: number;
    }>;
    totalRecords: number;
    dateRange: {
      startDate: string;
      endDate: string;
    };
  };
};

export const fetchTodayAttendance = async (): Promise<TodayAttendanceRecord[]> => {
  try {
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    
    const res = await axios.get(
      `/Attendances/daily-attendance?startDate=${todayStr}&endDate=${todayStr}`,
      {
        headers: {
          'accept': 'application/json',
        }
      }
    );
    
    // Handle the nested response structure
    const apiResponse: TodayAttendanceApiResponse = res.data;
    
    // Extract attendance records from the response
    if (apiResponse.data?.data && Array.isArray(apiResponse.data.data)) {
      // Flatten the attendance data
      const records: TodayAttendanceRecord[] = [];
      for (const dayData of apiResponse.data.data) {
        if (dayData.attendances && Array.isArray(dayData.attendances)) {
          for (const attendance of dayData.attendances) {
            records.push({
              _id: attendance._id || `${attendance.customerId}-${attendance.attendedDateTime}`,
              customerId: attendance.customerId,
              firstName: attendance.firstName,
              lastName: attendance.lastName,
              attendedDateTime: attendance.attendedDateTime,
              deactivateAt: attendance.deactivateAt,
              clientId: attendance.clientId,
              reference: attendance.reference,
            });
          }
        }
      }
      return records;
    }
    
    return [];
  } catch (error: any) {
    // Handle 502 Bad Gateway errors gracefully
    if (error?.response?.status === 502) {
      console.warn(
        "Backend service unavailable (502). " +
        "This may indicate the backend is starting up or temporarily unavailable. " +
        "The request will be retried automatically."
      );
    } else {
      console.error("Failed to fetch today's attendance data:", error);
    }
    
    // Return empty array on error to prevent UI crashes
    return [];
  }
};
