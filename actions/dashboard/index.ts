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
