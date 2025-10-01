"use client";

import { fetchPendingPaymentCustomers, PendingPaymentCustomer } from "@/actions/dashboard/pendingPayments";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { usePendingPaymentsSheet } from "@/hooks/usePendingPaymentsSheet";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import WhiteCard from "./WhiteCard";

const PendingPayments = () => {
  const { openPendingPaymentsSheet, setOpenPendingPaymentsSheet } = usePendingPaymentsSheet();
  
  const [customers, setCustomers] = useState<PendingPaymentCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (openPendingPaymentsSheet) {
      fetchData();
    }
  }, [openPendingPaymentsSheet]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPendingPaymentCustomers();
      setCustomers(data.customers);
    } catch (error) {
      console.error("Error fetching pending payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const getDaysPendingColor = (days: number) => {
    if (days <= 3) return "text-[#FFA500]"; // Orange
    if (days <= 7) return "text-[#FF6B35]"; // Dark Orange
    return "text-[#F04237]"; // Red
  };

  return (
    <Sheet open={openPendingPaymentsSheet} onOpenChange={setOpenPendingPaymentsSheet}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl min-h-[500px] max-h-[calc(100%-40px)] overflow-hidden flex flex-col"
      >
        <SheetHeader className="gap-3 flex-shrink-0">
          <SheetTitle className="text-[16px] font-semibold text-[#363636]">
            Payment Pending Customers
          </SheetTitle>
          <p className="text-[12px] text-[#6D6D6D]">
            Customers with deactivated date earlier than today
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <i className="loading-icon size-[30px] animate-spin" />
            </div>
          ) : customers.length > 0 ? (
            <div className="space-y-3 mt-4">
              {customers.map((customer) => (
                <WhiteCard key={customer._id} className="p-4">
                  <div className="space-y-3">
                    {/* Customer Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#fac1be] rounded-full flex items-center justify-center">
                          <span className="text-[14px] font-semibold text-[#F04237]">
                            {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-[#3D3D3D]">
                            {customer.firstName} {customer.lastName}
                          </p>
                          <p className="text-[11px] text-[#6D6D6D]">
                            ID: {customer.clientId}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-[14px] font-bold ${getDaysPendingColor(customer.daysPending)}`}>
                          {customer.daysPending} {customer.daysPending === 1 ? 'day' : 'days'}
                        </p>
                        <p className="text-[10px] text-[#6D6D6D]">overdue</p>
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-[#6D6D6D] mb-1">Package</p>
                        <p className="text-[12px] font-medium text-[#3D3D3D]">
                          {customer.packageName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#6D6D6D] mb-1">Deactivated Date</p>
                        <p className="text-[12px] font-medium text-[#F04237]">
                          {formatDate(customer.deactivatedDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#6D6D6D] mb-1">Mobile</p>
                        <p className="text-[12px] font-medium text-[#3D3D3D]">
                          {customer.mobileNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#6D6D6D] mb-1">Email</p>
                        <p className="text-[12px] font-medium text-[#3D3D3D] truncate">
                          {customer.email}
                        </p>
                      </div>
                    </div>

                    {/* Amount Due */}
                    {customer.amountDue && (
                      <div className="bg-[#FEF7EE] rounded-[10px] p-2 flex items-center justify-between">
                        <p className="text-[11px] text-[#EB5F14]">Amount Due:</p>
                        <p className="text-[14px] font-bold text-[#EB5F14]">
                          LKR {customer.amountDue.toLocaleString()}
                        </p>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => {
                        // TODO: Navigate to customer details or payment collection
                        console.log("Collect payment for:", customer.clientId);
                      }}
                      className="w-full bg-[#F04237] text-white rounded-[10px] py-2 text-[12px] font-semibold hover:bg-[#D93A2F] transition-colors"
                    >
                      Collect Payment
                    </button>
                  </div>
                </WhiteCard>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <i className="total-client size-[48px] text-[#9CA3AF] mb-3" />
              <p className="text-[14px] text-[#6D6D6D] text-center">
                No pending payment customers found
              </p>
              <p className="text-[12px] text-[#9CA3AF] text-center mt-1">
                All customers are up to date!
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PendingPayments;

