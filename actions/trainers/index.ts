"use server";
import axios from "@/utils/axios";



export const  getTrainers = async () => {
  try {
    const response = await axios.get("/admin/admin-management/getAllMembers");
    console.log("Response data:", response.data);

    return (response.data.data);
  } catch (error) {
    console.error("Failed to fetch trainers:", error);
    // Return dummy data if API fails
    return [
    ];
  }
}

export interface PaymentData {
  id: string;
  registeredDate: string;
  sessionCount: string;
  month: string;
  salaryAmount: string;
  status: "paid" | "unpaid";
}

export async function getTrainerPayments(trainerId: string): Promise<PaymentData[]> {
  try {
    // NOTE: Backend endpoint /trainers/${trainerId}/payments doesn't exist yet
    // Backend needs to implement trainer payment endpoints
    // This will fail until backend implements the endpoint
    const response = await axios.get(`/trainers/${trainerId}/payments`);
    return response.data.map((payment: any) => ({
      id: payment._id,
      registeredDate: new Date(payment.registeredDate).toLocaleDateString('en-GB'),
      sessionCount: payment.sessionCount.toString(),
      month: payment.month,
      salaryAmount: payment.salaryAmount.toLocaleString(),
      status: payment.status,
    }));
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    // Return dummy data if API fails
    return [
      {
        id: "1",
        registeredDate: "10/03/25",
        sessionCount: "25",
        month: "March",
        salaryAmount: "25,000",
        status: "unpaid",
      },
      {
        id: "2",
        registeredDate: "10/04/25",
        sessionCount: "30",
        month: "April",
        salaryAmount: "30,000",
        status: "paid",
      },
    ];
  }
}



export const deactivateTrainer = async (
  trainerId: string
): Promise<{
  status: "SUCCESS" | "FAIL";
  message?: string;
}> => {
  try {
    // NOTE: Backend endpoint /trainers/${trainerId}/deactivate doesn't exist yet
    // Backend needs to implement trainer deactivation endpoint
    // This will fail until backend implements the endpoint
    await axios.patch(`/trainers/${trainerId}/deactivate`);
    return {
      status: "SUCCESS",
      message: "Trainer deactivated successfully",
    };
  } catch (error: any) {
    console.error("Failed to deactivate trainer:", error);
    return {
      status: "FAIL",
      message: error.response?.data?.message || "Failed to deactivate trainer",
    };
  }
}