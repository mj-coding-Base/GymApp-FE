"use client";

import { fetchIndividualCustomers, getUserPaymentsId } from "@/actions/customers";
import CommonSearch from "@/components/common/Search";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCollectPaymentIndividualSheet } from "@/hooks/useCollectPaymentIndividualSheet";
import { useExtraPaymentCollectionSheet } from "@/hooks/usePaymentCollectionExtra";
import { usePaymentCollectionIndividualSheet } from "@/hooks/usePaymentCollectionIndividualSheet";
import { IndividualCustomer, PaymentHistory } from "@/types/Customer";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PaymentCollectionExtra } from "./PaymentCollectionExtra";
import PaymentCollectionIndividual from "./PaymentCollectionIndividual";

const CollectPaymentIndividual = () => {
  // State management
  const [paymentData, setPaymentData] = useState<PaymentHistory[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [customer, setCustomer] = useState<IndividualCustomer | null>(null);

  // Track current search term to avoid stale closure issues
  const [currentSearch, setCurrentSearch] = useState<string | null>(null);
  const [currentCustomerId, setCurrentCustomerId] = useState<string | null>(null);

  // Hooks for search params and modal controls
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get("search");

  const {
    openCollectPaymentIndividualSheet,
    setOpenCollectPaymentIndividualSheet,
  } = useCollectPaymentIndividualSheet();

  const { setOpenPaymentCollectionIndividualSheet } =
    usePaymentCollectionIndividualSheet();
  const { setOpenExtraPaymentCollectionSheet } = useExtraPaymentCollectionSheet();

  // Derived state for button disabled status
  const buttonsDisabled = !customer || loading;

  // Effect: Load customer based on search query
  useEffect(() => {
    if (!searchQuery || searchQuery === currentSearch) {
      return; // Skip if same or empty
    }

    setCurrentSearch(searchQuery); // Track new search
    setCustomer(null); // Clear previous result
    setPaymentData(null);

    const loadCustomer = async () => {
      if (!searchQuery.trim()) {
        setCustomer(null);
        return;
      }
      setLoading(true);
      try {
        const result = await fetchIndividualCustomers("1","1",searchQuery);
        const foundCustomer = result.results?.[0] ?? null;

console.log(foundCustomer.clientId)
        setCustomer(foundCustomer);
        if (foundCustomer.clientId) {
          setCurrentCustomerId(foundCustomer.clientId);
        } else {
          setCurrentCustomerId(null);
        }
      } catch (error) {
        console.error("Failed to fetch customer:", error);
        setCustomer(null);
        setCurrentCustomerId(null);
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [searchQuery, currentSearch]);

  // Effect: Load payment history only when customer ID changes
  useEffect(() => {
    if (!currentCustomerId) {
      setPaymentData(null);
      return;
    }

    const loadPaymentHistory = async () => {
      setLoading(true);
      try {
        const response = await getUserPaymentsId(currentCustomerId);
        setPaymentData(response);
      } catch (error) {
        console.error("Failed to fetch payment history:", error);
        setPaymentData(null);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentHistory();
  }, [currentCustomerId]);

  const refreshPaymentData = async () => {
    if (!currentCustomerId) return;
    
    setLoading(true);
    try {
      const response = await getUserPaymentsId(currentCustomerId);
      setPaymentData(response);
    } catch (error) {
      console.error("Failed to refresh payment history:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
    <Sheet
        open={openCollectPaymentIndividualSheet}
        onOpenChange={setOpenCollectPaymentIndividualSheet}
    >
      <SheetContent side="bottom" className="rounded-t-2xl min-h-[500px] max-h-[calc(100%-40px)]">
        <SheetHeader className="gap-[20px]">
          <SheetTitle className="text-[14px] font-semibold text-[#363636] text-center">
            Collect Payment
          </SheetTitle>
          <div className="relative w-full max-w-sm">
            <Suspense fallback={<div>Loading...</div>}>
              <CommonSearch />
            </Suspense>
          </div>
        </SheetHeader>

        <div className="px-4 overflow-y-auto">
          {customer ? (
            (() => {
              // Check if deactivation date is earlier than today
              const isPaymentOverdue = customer.deactivateAt 
                ? new Date(customer.deactivateAt) < new Date()
                : false;
              
              const paymentStatus = isPaymentOverdue ? "Not Paid" : "Paid";
              const paymentBgColor = isPaymentOverdue ? "bg-[#D32F2F]" : "bg-[#4CAF50]";
              
              return (
                <div className={`mt-[10px] border-[1px] border-[#000000] rounded-[12px] overflow-hidden 
                  ${customer.isActive ? "" : "bg-[#fac1be]" }`}>
                  <div className="flex border-b-[1px] border-b-[#000000]">
                    <div className="flex-[35%] px-[10px] py-[7.8px]">
                      <p className="text-[#6D6D6D] text-[12px] font-medium">Package ID</p>
                      <p className="text-[#3D3D3D] text-[12px] font-semibold">
                        {customer.packageId ?? "--"}
                      </p>
                    </div>
                    <div className="flex-[35%] px-[10px] py-[7.8px] border-x-[1px] border-x-[#000000]">
                      <p className="text-[#6D6D6D] text-[12px] font-medium">Customer ID</p>
                      <p className="text-[#3D3D3D] text-[12px] font-semibold">{customer.clientId ?? "--"}</p>
                    </div>
                    <div className="flex-[30%] px-[10px] py-[7.8px]">
                      <p className="text-[#6D6D6D] text-[12px] font-medium">Dactivation Date</p>
                      <p className="text-[#3D3D3D] text-[12px] font-semibold">
                        {customer.deactivateAt?.slice(0, 10) ?? "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-[35%] px-[10px] py-[7.8px]">
                      <p className="text-[#6D6D6D] text-[12px] font-medium">Name</p>
                      <p className="text-[#3D3D3D] text-[12px] font-semibold">
                        {customer.firstName} {customer.lastName}
                      </p>
                    </div>
                    <div className="flex-[35%] px-[10px] py-[7.8px] border-x-[1px] border-x-[#000000]">
                      <p className="text-[#6D6D6D] text-[12px] font-medium">NIC</p>
                      <p className="text-[#3D3D3D] text-[12px] font-semibold">{customer.nic}</p>
                    </div>
                    <div className="flex-[30%] px-[10px] py-[7.8px]">
                      <p className="text-[#6D6D6D] text-[12px] font-medium">Payment</p>
                      <p
                        className={`${paymentBgColor} text-center rounded-[15px] px-[0px] py-[5px] text-[#FFFFFF] text-[12px]/[100%] font-semibold`}
                      >
                        {paymentStatus}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <p className="text-center mt-4 text-xs text-gray-400">Search user for data</p>
          )}

          <p className="mt-[16px] mb-[13.5px] text-[12px]/[15px] text-[#888888] font-semibold">
            Payment History
          </p>

          {loading ? (
            <div className="min-h-[500px] flex items-center justify-center">
              <i className="size-[45px] animate-spin loading-icon" />
            </div>
          ) : (
            <div className="border-[#EEEEEE] border-[0.9px] rounded-[15px] overflow-hidden">
              <div className="flex bg-[#F5F5F5] px-[13.5px] py-[15.5px]">
                <p className="w-[30%] text-[11px]/[14px] font-medium text-[#212121]">
                  Payment Date
                </p>
                <p className="w-[20%] text-[11px]/[14px] font-medium text-[#212121]">
                  Month
                </p>
                <p className="w-[20%] text-[11px]/[14px] font-medium text-[#212121]">
                  Payment ID
                </p>
                <p className="w-[30%] text-[11px]/[14px] font-medium text-[#212121]">
                  Amount
                </p>
              </div>
              {paymentData && paymentData.length === 0 && (
                <div className="px-[13.5px] py-[32px] text-center border-t-[#E7E7E7] border-t-[1px]">
                  <p className="text-[12px] text-[#888888]">No payment history found</p>
                </div>
              )}
              {paymentData && paymentData.length > 0 ? (
                paymentData.map((item) => (
                  <div
                    key={item._id}
                    className={`flex px-[13.5px] py-[18px] border-t-[#E7E7E7] border-t-[1px] ${
                      item.isExtra ? "bg-[#FFEEA9]" : ""
                    }`}
                  >

                    <p className="w-[30%] text-[12px]/[13.5px] font-normal text-[#212121]">
                      {item.createdAt.slice(0, 10)}
                    </p>
                    <p className="w-[20%] text-[12px]/[13.5px] font-normal text-[#212121]">
                      {item.month}
                    </p>
                    <p className="w-[20%] text-[12px]/[13.5px] font-normal text-[#212121]">
                      {item.paymentId}
                    </p>
                    <p className="w-[30%] text-[12px]/[13.5px] font-normal text-[#212121]">
                      LKR {item.amount}
                    </p>
                  </div>
                ))
              ) : (
                <div className="px-[13.5px] py-[18px] text-center text-gray-400 text-sm">
                  No payments found
                </div>
              )}
            </div>
          )}
        </div>

        <SheetFooter className="grid grid-cols-2 gap-[15px]">
          <Button
            variant={"outline"}
            disabled = {buttonsDisabled}
            onClick={() => {
              setOpenCollectPaymentIndividualSheet(false);
              setOpenExtraPaymentCollectionSheet(true);
            }}
            className="border-[#69716C] rounded-[10px] text-[13px] font-semibold text-[#69716C] h-[40px]"
          >
            Extra Payment
          </Button>
          <Button
            type="button"
            disabled = {buttonsDisabled}
            onClick={() => {
              setOpenCollectPaymentIndividualSheet(false);
              setOpenPaymentCollectionIndividualSheet(true);
            }}
            className="bg-[#363636] rounded-[10px] text-[13px] font-semibold text-[#FFFFFF] h-[40px]"
          >
            Collect
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
          <PaymentCollectionIndividual clientId={currentCustomerId} onPaymentSuccess={refreshPaymentData}/>
          <PaymentCollectionExtra clientId={currentCustomerId} onPaymentSuccess={refreshPaymentData}/>
    </>
  );
};

export default CollectPaymentIndividual;