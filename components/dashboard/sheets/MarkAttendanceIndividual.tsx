"use client";

import { fetchIndividualCustomers } from "@/actions/customers";
import { markIndividualAttendance } from "@/actions/session";
import { Button } from "@/components/ui/button";
import {    
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMarkAttendanceIndividualSheet } from "@/hooks/useMarkAttendanceIndividualSheet";
import { IndividualCustomer } from "@/types/Customer";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import CommonSearch from "@/components/common/Search";
import { useEffect, useState } from "react";
import { Suspense } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSession } from "@/context/session-context";

const MarkAttendanceIndividual = () => {
  const {
    openMarkAttendanceIndividualSheet,
    setOpenMarkAttendanceIndividualSheet,
  } = useMarkAttendanceIndividualSheet();

  const [loading, setLoading] = useState<boolean>(false);
  const [customers, setCustomers] = useState<IndividualCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  // Track current search term to avoid stale closure issues
  const [currentSearch, setCurrentSearch] = useState<string | null>(null);

  // Hooks for search params
  const searchParams = useSearchParams();
  const paramsSearchQuery = searchParams?.get("search") || "";

  const { session } = useSession();

  // Effect: Load customer based on search query
  useEffect(() => {
    if (paramsSearchQuery === currentSearch) {
      return; // Skip if same
    }

    setCurrentSearch(paramsSearchQuery); // Track new search
    setCustomers([]); // Clear previous results
    setSelectedCustomer(null);

    const loadCustomer = async () => {
      if (!paramsSearchQuery.trim()) {
        setCustomers([]);
        return;
      }

      setLoading(true);
      try {
        const result = await fetchIndividualCustomers("1", "1", paramsSearchQuery);
        setCustomers(result.results || []);
      } catch (error) {
        console.error("Failed to fetch customer:", error);
        setCustomers([]);
        toast.error("Failed to fetch customers");
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [paramsSearchQuery, currentSearch]);

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomer(customerId === selectedCustomer ? null : customerId);
  };

  const handleMarkAttendance = async () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }

    const customer = customers.find(c => c._id === selectedCustomer);
    if (!customer) {
      toast.error("Customer not found");
      return;
    }

    try {
      const result = await markIndividualAttendance({
        customerId: customer._id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        trainerId: session?.user?.id || "",
        trainerName: session?.user?.name || ""
      });
      
      if (result.status === "SUCCESS") {
        toast.success(result.message);
        setOpenMarkAttendanceIndividualSheet(false);
        // Reset form
        setSelectedCustomer(null);
        setCustomers([]);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to mark attendance");
      console.error("Attendance marking error:", error);
    }
  };

  return (
    <Sheet
      open={openMarkAttendanceIndividualSheet}
      onOpenChange={setOpenMarkAttendanceIndividualSheet}
    >
      <SheetContent
        side="bottom"
        className="rounded-t-2xl min-h-120 max-h-[calc(100%-40px)]"
      >
        <SheetHeader className="gap-5">
          <SheetTitle className="text-[14px] font-semibold text-[#363636]">
            Mark Attendance for Individual
          </SheetTitle>
          <SheetDescription className="relative w-full max-w-sm">
            <Suspense fallback={<div>Loading...</div>}>
              <CommonSearch />
            </Suspense>
          </SheetDescription>
          {customers.length > 0 ? (
            <div className="flex flex-col gap-[5px]">
            <div className="flex items-center bg-[#F7F7F7] rounded-[10px] p-[11px] text-[11px] font-semibold text-[#363636]">
              <span className="flex-1">Name</span>
              <span className="flex-1">Client ID</span>
              <span className="flex-1">Session Count</span>
              <span className="w-5"></span> {/* Empty space for radio button alignment */}
            </div>
              {customers.map((customer) => (
                <RadioGroup key={customer._id}>
                  <div className={`
                    flex items-center rounded-[10px] p-[11px] text-[11px] font-normal
                    ${customer.availableSessionQuota === 0 || customer.isActive === false
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-[#F7F7F7] text-[#4F4F4F]'}
                  `}>
                    <span className="flex-1">{customer.firstName} {customer.lastName}</span>
                    <span className="flex-1">{customer.clientld}</span>
                    <span className="flex-1">
                      {customer.availableSessionQuota === 0 ? (
                        <span className="text-red-500">No sessions left</span>
                      ) : (
                        customer.availableSessionQuota
                      )}
                    </span>
                    <RadioGroupItem
                      value={customer._id}
                      checked={selectedCustomer === customer._id}
                      onClick={() => (customer.availableSessionQuota > 0 && customer.isActive !== false) && handleCustomerSelect(customer._id)}
                      className={(customer.availableSessionQuota === 0 || customer.isActive === false) ? 'opacity-50 cursor-not-allowed' : 'bg-white'}
                      disabled={customer.availableSessionQuota === 0 || customer.isActive === false}
                    />
                  </div>
                </RadioGroup>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-[11px] text-[#4F4F4F]">
              {paramsSearchQuery ? "No customers found. Try another search." : "Enter a name or NIC to search"}
            </div>
          )}
        </SheetHeader>
        <div className="grid grid-cols-2 gap-[15px] px-4 pb-4">
          <SheetClose asChild className="flex">
            <Button
              variant={"outline"}
              className="border-[#69716C] rounded-[10px] text-[13px] font-semibold text-[#69716C] h-[40px]"
              onClick={() => {
                setSelectedCustomer(null);
                setCustomers([]);
              }}
            >
              Cancel
            </Button>
          </SheetClose>
          <Button
            onClick={handleMarkAttendance}
            className="bg-[#378644] rounded-[10px] text-[13px] font-semibold text-[#FFFFFF] h-[40px]"
            disabled={!selectedCustomer || loading}
          >
            Mark Attendance
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MarkAttendanceIndividual;