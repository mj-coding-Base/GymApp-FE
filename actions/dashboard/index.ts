"use server";
import axios from "@/utils/axios";

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

export const fetchDashboardData = async (): Promise<DashboardData> => {
  try {
    const res = await axios.get("/admin/admin-management/dashboard");
    return res.data.data;
  } catch (error) {
    console.error("API request failed. Returning dummy data.", error);

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
    const res = await axios.get(
      `/Attendances/daily-attendance?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          'accept': 'application/json',
          'gym-id': 'Hiru-Fitness'
        }
      }
    );
    
    // Handle the nested response structure
    const apiResponse: DailyAttendanceApiResponse = res.data;
    return apiResponse.data.data;
  } catch (error) {
    console.error("Failed to fetch daily attendance data:", error);
    
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