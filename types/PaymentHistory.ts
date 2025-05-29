interface Payment {
  id?: string;
  registeredDate?: string;
  sessionCount?: string;
  month?: string;
  salaryAmount?: string;
  status?: "paid" | "unpaid";
}

interface SettlementData {
  name: string;
  nic: string;
  amount: string;
}

interface PaymentResponse {
  status: "SUCCESS" | "FAIL";
  message?: string;
  data?: Payment[];
}

interface PaymentHistoryProps {
  trainerType?: string;
  trainerId: string;
}