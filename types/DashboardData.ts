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