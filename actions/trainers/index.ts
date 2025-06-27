"use server";
import axios from "@/utils/axios";
import { z } from "zod";
import { Type, Status } from "@/types/TrainerDetails";

export interface Trainer {
  id: string;
  registeredDate: string;
  type: Type;
  status: Status;
  trainerName: string;
  nic: string;
  email: string;
  mobile: string;
  profileImage?: string;
}

export async function getTrainers(): Promise<Trainer[]> {
  try {
    const response = await axios.get("/trainers");
    return response.data.map((trainer: any) => ({
      id: trainer._id,
      registeredDate: new Date(trainer.registeredDate).toLocaleDateString('en-GB'),
      type: trainer.type,
      status: trainer.status,
      trainerName: trainer.name,
      nic: trainer.nic,
      email: trainer.email,
      mobile: trainer.mobile,
      profileImage: trainer.profileImage,
    }));
  } catch (error) {
    console.error("Failed to fetch trainers:", error);
    // Return dummy data if API fails
    return [
      {
        id: "1",
        registeredDate: "10/03/25",
        type: Type.PART_TIME,
        status: Status.ACTIVE,
        trainerName: "Mahesh Karunarathna",
        nic: "1234567890",
        email: "mahesh@gmail.com",
        mobile: "1234567890",
      },
      {
        id: "2",
        registeredDate: "10/03/25",
        type: Type.FULL_TIME,
        status: Status.INACTIVE,
        trainerName: "Manoj Karunarathna",
        nic: "1234567890",
        email: "mahesh@gmail.com",
        mobile: "1234567890",
      },
    ];
  }
}

export const trainerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  mobileNumber: z.string().min(4, "Mobile number is required"),
  email: z.string().email("Invalid email address"),
  nic: z.string().min(1, "NIC is required"),
  type: z.enum(["part-time", "full-time"]),
  session: z.string().optional(),
});

export type TrainerFormData = z.infer<typeof trainerSchema>;
export async function registerTrainer(data: TrainerFormData): Promise<{
  status: "SUCCESS" | "FAIL";
  message?: string;
  data?: any;
}> {
  try {
    const response = await axios.post("/api/v1/admin/trainer-management", {
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.mobileNumber,
      email: data.email,
      nic: data.nic,
      type: data.type,
      noOfplannedSessions: data.type === "full-time" ? Number(data.session || 0) : undefined,
      status: "ACTIVE", // Default initial status
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return {
      status: "SUCCESS",
      message: "Trainer registered successfully",
      data: response.data,
    };
  } catch (error: any) {
    console.error("Failed to register trainer:", error);
    return {
      status: "FAIL",
      message: error.response?.data?.message || "Failed to register trainer",
    };
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


export const settlementSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nic: z.string().min(1, "NIC is required"),
  amount: z.string().min(1, "Amount is required"),
});

export async function settlePayment(
  paymentId: string,
  data: z.infer<typeof settlementSchema>
): Promise<{
  status: "SUCCESS" | "FAIL";
  message?: string;
}> {
  try {
    await axios.post(`/payments/${paymentId}/settle`, {
      name: data.name,
      nic: data.nic,
      amount: parseFloat(data.amount.replace(/,/g, '')),
    });

    return {
      status: "SUCCESS",
      message: "Payment settled successfully",
    };
  } catch (error: any) {
    console.error("Failed to settle payment:", error);
    return {
      status: "FAIL",
      message: error.response?.data?.message || "Failed to settle payment",
    };
  }
}
import { ClientType } from "@/types/SessionHistory";

export interface SessionData {
  id: string;
  date: string;
  session: string;
  clientType: ClientType;
}

export async function getTrainerSessions(
  trainerId: string,
  trainerType: string
): Promise<SessionData[]> {
  try {
    const response = await axios.get(`/trainers/${trainerId}/sessions`);
    return response.data.map((session: any) => ({
      id: session._id,
      date: new Date(session.date).toLocaleDateString('en-GB'),
      session: session.sessionNumber.toString(),
      clientType: session.clientType,
    }));
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    // Return dummy data if API fails
    return [
      { id: "1", date: "6/3/25", session: "1", clientType: ClientType.INDIVIDUAL },
      { id: "2", date: "6/3/25", session: "1", clientType: ClientType.GROUP },
      { id: "3", date: "6/3/25", session: "3", clientType: ClientType.GROUP },
      { id: "4", date: "6/3/25", session: "4", clientType: ClientType.GROUP },
      { id: "5", date: "6/3/25", session: "5", clientType: ClientType.GROUP },
    ];
  }
}


export async function deactivateTrainer(
  trainerId: string
): Promise<{
  status: "SUCCESS" | "FAIL";
  message?: string;
}> {
  try {
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