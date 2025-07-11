"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useViewGroupDetails } from "@/hooks/useGroupDetailsSheet";
import React, { useState, useEffect } from "react";
import { searchCustomers } from "@/actions/customers";
import { Customer } from "@/types/Customer";
import { toast } from "sonner";

const TransferMemberToAGroup = () => {
  const {
    openTransferMemberToAGroup,
    setOpenTransferMemberToAGroup,
    setOpenTransferMemberToExistingGroup,
    setOpenAddNewGroup,
  } = useViewGroupDetails();

  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Customer[]>([]);
  console.log(clients)
  const [loading, setLoading] = useState(false);
  console.log(loading);
  const [error, setError] = useState<string | null>(null);
  console.log(error);
  const [selectedClient] = useState<string | null>(null);

  useEffect(() => {
    if (openTransferMemberToAGroup) {
      fetchClientData();
    }
  }, [openTransferMemberToAGroup]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await searchCustomers(searchTerm);
      setClients(response || []);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError("Failed to load clients");
      toast.error("Failed to load client data");
    } finally {
      setLoading(false);
    }
  };

  const handleTransferToExisting = () => {
    if (!selectedClient) {
      toast.warning("Please select a client first");
      return;
    }
    setOpenTransferMemberToAGroup(false);
    setOpenTransferMemberToExistingGroup(true);
    // You might want to pass the selected client ID to the next sheet
  };

  const handleTransferToNew = () => {
    if (!selectedClient) {
      toast.warning("Please select a client first");
      return;
    }
    setOpenTransferMemberToAGroup(false);
    setOpenAddNewGroup(true);
    // You might want to pass the selected client ID to the next sheet
  };

  return (
    <Sheet
      open={openTransferMemberToAGroup}
      onOpenChange={setOpenTransferMemberToAGroup}
    >
      <SheetContent
        side="bottom"
        hideClose={true}
        className="rounded-t-2xl min-h-[600px] max-h-[calc(100%-40px)] px-[14px] pt-[14px] gap-5 flex flex-col"
      >
        <SheetHeader className="hidden">
          <SheetTitle></SheetTitle>
        </SheetHeader>
        
        <SheetClose className="flex gap-[5px]">
          <i className="back-icon size-4 text-[#1D1B20]" />
          <p className="text-[11.2px]/[14px]">Back</p>
        </SheetClose>
        
        <h1 className="text-[14.4px]/[17px] font-medium text-[#363636] text-center">
          Transfer Member to a Group
        </h1>
        
        <div className="flex flex-col gap-[10px]">
          <p className="text-[12px]/[15px] text-[#212121] font-normal">
            Select Client to Transfer
          </p>
          <div className="relative w-full max-w-sm h-[40px]">
            <i className="search-icon w-[16.54px] h-[18.9px] text-[#6D6D6D] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search by NIC / Name"
              className="pl-10 text-[11px] font-normal text-[#4F4F4F] h-[40px] border-[0.9px] border-[#6D6D6D]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1">

        </div>
        
        <div className="grid grid-cols-2 gap-[15px] mb-5">
          <Button
            onClick={handleTransferToExisting}
            variant={"outline"}
            className="border-[#69716C] rounded-[10px] text-[11px]/[16px] font-semibold text-[#69716C] h-[40px]"
          >
            Add to Existing Group
          </Button>
          <Button
            onClick={handleTransferToNew}
            className="bg-[#363636] rounded-[10px] text-[11px]/[16px] font-semibold text-[#FFFFFF] h-[40px]"
          >
            Add to New Group
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TransferMemberToAGroup;