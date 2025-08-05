"use server";
import axios from "@/utils/axios";

type DashboardData = {
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
    // console.log(res.data);
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
        { month: "January", amount: 10000 },
        { month: "February", amount: 10000 },
        { month: "March", amount: 10000 },
        { month: "April", amount: 10000 },
        { month: "May", amount: 10000 },
        { month: "June", amount: 10000 },
      ],
    };

    return dummyData;
  }
};
