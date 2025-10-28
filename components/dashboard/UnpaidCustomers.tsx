"use client";

import { fetchPendingPaymentCustomers, PendingPaymentCustomer } from "@/actions/dashboard/pendingPayments";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import WhiteCard from "./WhiteCard";

interface UnpaidCustomersProps {
  pendingPayments: number;
}

const UnpaidCustomers: React.FC<UnpaidCustomersProps> = ({ pendingPayments }) => {
  const [unpaidCustomers, setUnpaidCustomers] = useState<PendingPaymentCustomer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUnpaidCustomers = async () => {
      setLoading(true);
      try {
        const data = await fetchPendingPaymentCustomers(1, 10, "");
        setUnpaidCustomers(data.customers.slice(0, 10)); // Show only top 10
      } catch (error) {
        console.error("Error fetching unpaid customers:", error);
        setUnpaidCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUnpaidCustomers();
  }, []);

  if (loading) {
    return (
      <div className="mb-[32px]">
        <Card className="pt-[33px]">
          <CardContent className="p-[24px]">
            <div className="flex items-center justify-center h-[200px]">
              <i className="loading-icon size-[32px] animate-spin text-[#F04237]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-[32px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[14px] font-semibold text-[#44424D]">Unpaid Customers</h2>
        <p className="text-[12px] text-[#6D6D6D]">{pendingPayments} total</p>
      </div>
      <Card className="pt-[33px] max-h-[400px] overflow-y-auto">
        <CardContent className="p-0">
          {unpaidCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <i className="total-client size-[48px] text-[#9CA3AF] mb-3" />
              <p className="text-[14px] text-[#6D6D6D] text-center">
                No unpaid customers found
              </p>
              <p className="text-[12px] text-[#9CA3AF] text-center mt-1">
                All customers are up to date!
              </p>
            </div>
          ) : (
            <div className="space-y-3 px-6 pb-6">
              {unpaidCustomers.map((customer) => (
                <WhiteCard key={customer._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-[#fac1be] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[14px] font-semibold text-[#F04237]">
                          {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-[#3D3D3D] truncate">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-[11px] text-[#6D6D6D]">
                          ID: {customer.clientId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center px-2 py-1 rounded-[6px] bg-red-100">
                        <p className="text-[11px] font-bold text-[#F04237]">
                          UNPAID
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <p className="text-[#6D6D6D] mb-1">Package ID</p>
                        <p className="text-[#3D3D3D] font-medium">{customer.packageId}</p>
                      </div>
                      <div>
                        <p className="text-[#6D6D6D] mb-1">Status</p>
                        <p className="text-[#3D3D3D] font-medium">{customer.status}</p>
                      </div>
                    </div>
                  </div>
                </WhiteCard>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnpaidCustomers;

