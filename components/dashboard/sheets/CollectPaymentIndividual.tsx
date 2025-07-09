"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import CommonSearch from "@/components/common/Search";
import { useCollectPaymentIndividualSheet } from "@/hooks/useCollectPaymentIndividualSheet";
import { useExtraPaymentCollectionSheet } from "@/hooks/usePaymentCollectionExtra";
import { usePaymentCollectionIndividualSheet } from "@/hooks/usePaymentCollectionIndividualSheet";
import { fetchIndividualCustomers } from "@/actions/customers";
import { PaymentHistory, IndividualCustomer } from "@/types/Customer";
import { getUserPaymentsId } from "@/actions/customers";
import PaymentCollectionIndividual from "./PaymentCollectionIndividual";
import { PaymentCollectionExtra } from "./PaymentCollectionExtra";


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
      console.log("searchQuery is  ", searchQuery)
      setLoading(true);
      try {
        const result = await fetchIndividualCustomers("1","1",searchQuery);
        const foundCustomer = result.results?.[0] ?? null;

        setCustomer(foundCustomer);

        if (foundCustomer?._id) {
          setCurrentCustomerId(foundCustomer._id);
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
        const response = await getUserPaymentsId(currentCustomerId as string);
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

  console.log("Current Customer:", customer);
  console.log("Current Customer ID:", currentCustomerId);
  console.log("Payment Data:", paymentData);

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
          <SheetDescription className="relative w-full max-w-sm">
            <CommonSearch />
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 overflow-y-auto">
          {customer ? (
            <div className="mt-[10px] border-[1px] border-[#000000] rounded-[12px] overflow-hidden">
              <div className="flex border-b-[1px] border-b-[#000000]">
                <div className="flex-[35%] px-[10px] py-[7.8px]">
                  <p className="text-[#6D6D6D] text-[12px] font-medium">Avilable sessions</p>
                  <p className="text-[#3D3D3D] text-[12px] font-semibold">
                    {customer.availableSessionQuota ?? "--"}
                  </p>
                </div>
                <div className="flex-[35%] px-[10px] py-[7.8px] border-x-[1px] border-x-[#000000]">
                  <p className="text-[#6D6D6D] text-[12px] font-medium">Customer ID</p>
                  <p className="text-[#3D3D3D] text-[12px] font-semibold">{customer.clientld ?? "--"}</p>
                </div>
                <div className="flex-[30%] px-[10px] py-[7.8px]">
                  <p className="text-[#6D6D6D] text-[12px] font-medium">Today</p>
                  <p className="text-[#3D3D3D] text-[12px] font-semibold">
                    {new Date().toLocaleDateString("en-GB")}
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
                    className={`bg-${
                      customer.isPaid == null ?  "[#D32F2F]" : customer.isPaid ? "[#4CAF50]" : "[#D32F2F]"
                    } text-center rounded-[15px] px-[0px] py-[5px] text-[#FFFFFF] text-[12px]/[100%] font-semibold`}
                  >
                    {customer.isPaid == null ?  "Not Paid" : customer.isPaid ? "Paid" : "Not Paid"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center mt-4 text-xs text-gray-400">No results found</p>
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
                <p className="w-[40%] text-[11px]/[14px] font-medium text-[#212121]">
                  Payment Date
                </p>
                <p className="w-[20%] text-[11px]/[14px] font-medium text-[#212121]">
                  Month
                </p>
                <p className="w-[20%] text-[11px]/[14px] font-medium text-[#212121]">
                  Payment ID
                </p>
                <p className="w-[20%] text-[11px]/[14px] font-medium text-[#212121]">
                  Amount
                </p>
              </div>
              {paymentData && paymentData.length > 0 ? (
                paymentData.map((item) => (
                  <div
                    key={item._id}
                    className={`flex px-[13.5px] py-[18px] border-t-[#E7E7E7] border-t-[1px] ${
                      item.isExtra ? "bg-[#FFEEA9]" : ""
                    }`}
                  >

                    <p className="w-[40%] text-[12px]/[13.5px] font-normal text-[#212121]">
                      {item.createdAt.slice(0, 10)}
                    </p>
                    <p className="w-[20%] text-[12px]/[13.5px] font-normal text-[#212121]">
                      {item.month}
                    </p>
                    <p className="w-[20%] text-[12px]/[13.5px] font-normal text-[#212121]">
                      {item.paymentId}
                    </p>
                    <p className="w-[20%] text-[12px]/[13.5px] font-normal text-[#212121]">
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