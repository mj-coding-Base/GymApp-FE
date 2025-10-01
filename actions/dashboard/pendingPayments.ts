"use server";
import axios from "@/utils/axios";

export type PendingPaymentCustomer = {
  _id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  packageName: string;
  deactivatedDate: string;
  daysPending: number;
  amountDue?: number;
  fee?: number;
  isActive: boolean;
  isPaid: boolean;
  package_name?: string;
};

export type PendingPaymentsResponse = {
  customers: PendingPaymentCustomer[];
  totalCount: number;
};

// Calculate days between deactivated date and today
const calculateDaysPending = (deactivatedDate: string): number => {
  const today = new Date();
  const deactivated = new Date(deactivatedDate);
  const diffTime = today.getTime() - deactivated.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const fetchPendingPaymentCustomers = async (): Promise<PendingPaymentsResponse> => {
  try {
    // Fetch all customers with a larger page size to get potential pending customers
    const res = await axios.get("/admin/customer-management/get-all", {
      params: {
        page: 1,
        size: 1000, // Large size to get all potential pending customers
        searchTerm: undefined
      },
      headers: {
        'gym-id': 'Hiru-Fitness'
      }
    });

    console.log("Pending Payments API Response:", res.data);

    const results = res.data?.data?.results || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    // Filter customers with deactivated date earlier than today
    const pendingCustomers = results
      .filter((customer: any) => {
        // Check if customer has a deactivatedDate field
        if (customer.deactivatedDate) {
          const deactivatedDate = new Date(customer.deactivatedDate);
          deactivatedDate.setHours(0, 0, 0, 0);
          return deactivatedDate < today;
        }
        // Alternative: if no deactivatedDate, check for inactive and unpaid customers
        return customer.isActive === false && customer.isPaid === false;
      })
      .map((customer: any) => ({
        _id: customer._id,
        clientId: customer.clientId || customer._id,
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.email || '',
        mobileNumber: customer.mobileNumber || '',
        packageName: customer.package_name || 'N/A',
        deactivatedDate: customer.deactivatedDate || customer.updatedAt || '',
        daysPending: customer.deactivatedDate 
          ? calculateDaysPending(customer.deactivatedDate)
          : 0,
        amountDue: customer.fee || 0,
        fee: customer.fee,
        isActive: customer.isActive,
        isPaid: customer.isPaid,
        package_name: customer.package_name,
      }))
      // Sort by days pending (most overdue first)
      .sort((a: any, b: any) => b.daysPending - a.daysPending);
    
    return {
      customers: pendingCustomers,
      totalCount: pendingCustomers.length,
    };
  } catch (error) {
    console.error("Failed to fetch pending payment customers:", error);
    
    // Return empty array on error
    return {
      customers: [],
      totalCount: 0,
    };
  }
};

