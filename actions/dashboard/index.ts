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

export type DailyAttendanceData = {
  date: string;
  attendances: Array<{
    customerId: string | number;
    firstName: string;
    lastName: string;
    time: string;
  }>;
};

export const fetchDashboardData = async (): Promise<DashboardData> => {
  try {
    const res = await axios.get("/admin/admin-management/dashboard");
    console.log(res.data);
    return res.data.data;
  } catch (error) {
    console.error("API request failed. Returning dummy data.", error);

    // Dummy fallback data
    const dummyData: DashboardData = {
      trainer: {
        partTime: 5,
        fullTime: 3,
      },
      client: {
        group: 12,
        individual: 7,
        pendingPayments: 4,
      },
      paymentHistory: [
        { month: "January", amount: 19200 },
        { month: "February", amount: 21950 },
        { month: "March", amount: 10350 },
        { month: "April", amount: 12500 },
        { month: "May", amount: 19950 },
        { month: "June", amount: 10500 },
      ],
    };

    return dummyData;
  }
};

export const fetchDailyAttendance = async (
  startDate: string,
  endDate: string
): Promise<DailyAttendanceData[]> => {
  try {
    const res = await axios.get(
      `/admin/admin-management/daily-attendance?startDate=${startDate}&endDate=${endDate}`
    );
    console.log(res.data);
    return res.data.data;
  } catch (error) {
    console.error("API request failed. Returning dummy data.", error);

    // Dummy fallback data
    const dummyData: DailyAttendanceData[] = [
      {
        date: startDate,
        attendances: [
          {
            customerId: "C001",
            firstName: "John",
            lastName: "Doe",
            time: "08:00 AM",
          },
          {
            customerId: "C002",
            firstName: "Jane",
            lastName: "Smith",
            time: "09:30 AM",
          },
        ],
      },
    ];

    return dummyData;
  }
};
