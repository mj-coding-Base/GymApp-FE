"use server";
import axios from "@/utils/axios";
import { Salaries } from "@/types/TrainerSalaries";

// Dummy data matching your UI example
const dummySalaries: Salaries[] = [
  {
    id: 1,
    date: "10/03/25",
    trainerName: "Mahesh Karunarathna",
    currentSession: "12",
    totalSalary: "35000",
    type: "Part Time",
    status: "Paid",
  },
  {
    id: 2,
    date: "10/03/25",
    trainerName: "Uddika Putha",
    currentSession: "12",
    totalSalary: "35000",
    type: "Full Time",
    status: "Not Paid",
  },
  {
    id: 3,
    date: "10/03/25",
    trainerName: "Mahesh Karunarathna",
    currentSession: "12",
    totalSalary: "35000",
    type: "Part Time",
    status: "Paid",
  },
  {
    id: 4,
    date: "10/03/25",
    trainerName: "Mahesh Karunarathna",
    currentSession: "12",
    totalSalary: "45000",
    type: "Part Time",
    status: "Not Paid",
  },
];

export async function getTrainerSalaries(): Promise<{
  status: "SUCCESS" | "FAIL";
  data: Salaries[];
  message?: string;
}> {
  try {
    // Make API call using your existing axios instance
    const response = await axios.get("/finances/trainer-salaries");
    
    // Transform API response to match your UI structure if needed
    const salaries = response.data.map((item: any) => ({
      id: item.id,
      date: new Date(item.paymentDate).toLocaleDateString('en-GB'), // Format as DD/MM/YY
      trainerName: `${item.trainer.firstName} ${item.trainer.lastName}`,
      currentSession: item.sessionCount.toString(),
      totalSalary: item.amount.toLocaleString(),
      type: item.employmentType,
      status: item.isPaid ? "Paid" : "Not Paid"
    }));

    return {
      status: "SUCCESS",
      data: salaries
    };
  } catch (error) {
    console.error("Failed to fetch trainer salaries:", error);
    
    // Return dummy data when API fails
    return {
      status: "FAIL",
      data: dummySalaries,
      message: "Using dummy data - API request failed"
    };
  }
}