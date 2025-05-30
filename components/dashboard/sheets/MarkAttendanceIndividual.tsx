"use client";

import { markMultipleAttendances, searchCustomers } from "@/actions/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useMarkAttendanceIndividualSheet } from "@/hooks/useMarkAttendanceIndividualSheet";
import { Customer, FetchedCustomer } from "@/types/Customer";
import { useState } from "react";
import { toast } from "sonner";

const MarkAttendanceIndividual = () => {
  const {
    openMarkAttendanceIndividualSheet,
    setOpenMarkAttendanceIndividualSheet,
  } = useMarkAttendanceIndividualSheet();

  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setCustomers([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchCustomers(searchQuery);
      // Map or cast the results to match your local Customer type
      setCustomers(
                    results.map((c: Partial<FetchedCustomer>) => ({
                      _id: c._id ?? "",
                      name: `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim(),
                      nic: c.nic ?? "",
                      email: c.email ?? "",
                      mobileNumber: c.phone ?? "",
                      packageId: c.package_id ?? "",
                      package_name: c.package_id ?? "",
                      status: c.status ?? "",
                      isActive: c.isActive ?? false,
                      createdAt: c.createdAt ?? "",
                      updatedAt: c.updatedAt ?? "",
                      isPaid: c.isPaid ?? false,
                      groupMembersNames: [],
                      type: "individual",
                    }))
                  );
    } catch (error) {
      console.error("Error searching customers:", error);
      toast.error("Failed to search customers");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCheckboxChange = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleMarkAttendance = async () => {
    if (selectedCustomers.length === 0) {
      toast.error("Please select at least one customer");
      return;
    }

    const result = await markMultipleAttendances(selectedCustomers);
    
    if (result.status === "SUCCESS") {
      toast.success(result.message);
      setOpenMarkAttendanceIndividualSheet(false);
      // Reset form
      setSearchQuery("");
      setSelectedCustomers([]);
      setCustomers([]);
    } else {
      toast.error(result.message);
    }
  };

  // Extracted label for the Mark Attendance button
  const markAttendanceLabel =
    selectedCustomers.length > 0
      ? `Mark (${selectedCustomers.length}) Attendance`
      : "Mark Attendance";

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
            <div className="flex gap-2">
              <div className="relative flex-1">
                <i className="search-icon w-[16.54px] h-[18.9px] text-[#000000] absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="search"
                  placeholder="Search by Full name/ NIC"
                  className="pl-10 text-[11px] font-normal text-[#4F4F4F]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-[#378644] rounded-[10px] text-[11px] font-semibold text-[#FFFFFF] h-[40px] px-4"
                disabled={isSearching}
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </SheetDescription>
          {customers.length > 0 ? (
            <div className="flex flex-col gap-[5px]">
              {customers.map((customer) => (
                  <RadioGroup key={customer._id}>
                <div
                  
                  className="flex items-center bg-[#F7F7F7] rounded-[10px] p-[11px] text-[11px] font-normal text-[#4F4F4F]"
                >
                  <span className="flex-1">{customer.name}</span>
                  <span className="flex-1">{customer.nic}</span>
                  <RadioGroupItem
                    value={customer._id}
                    checked={selectedCustomers.includes(customer._id)}
                    onClick={() => handleCheckboxChange(customer._id)}
                    className="bg-white"
                  />
                </div>
                  </RadioGroup>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-[11px] text-[#4F4F4F]">
              {searchQuery ? "No customers found. Try another search." : "Enter a name or NIC to search"}
            </div>
          )}
        </SheetHeader>
        <div className="grid grid-cols-2 gap-[15px] px-4 pb-4">
          <SheetClose asChild className="flex">
            <Button
              variant={"outline"}
              className="border-[#69716C] rounded-[10px] text-[13px] font-semibold text-[#69716C] h-[40px]"
              onClick={() => {
                setSearchQuery("");
                setSelectedCustomers([]);
                setCustomers([]);
              }}
            >
              Cancel
            </Button>
          </SheetClose>
          <Button
            onClick={handleMarkAttendance}
            className="bg-[#378644] rounded-[10px] text-[13px] font-semibold text-[#FFFFFF] h-[40px]"
            disabled={selectedCustomers.length === 0}
          >
            {markAttendanceLabel}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};


export default MarkAttendanceIndividual;
