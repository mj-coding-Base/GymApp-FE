"use client";

import { deactivateCustomer } from "@/actions/customers";
import { Badge } from "@/components/ui/badge";
import { useActions } from "@/hooks/modals/useActions";
import { IndividualCustomer } from "@/types/Customer";
import React, { useMemo, useState } from "react";
import AddNewMember from "./AddNewMember";
import ViewClientProfile from "./ClientProfile";

interface Props {
  customer: IndividualCustomer;
}

// ⚡ PERFORMANCE OPTIMIZATION: Memoize to prevent unnecessary re-renders
const IndividualCard = React.memo(({ customer }: Props) => {
  const [isClientProfileOpen, setIsClientProfileOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const { handleAction } = useActions();
  const [isActive, setIsActive] = useState(customer.isActive);

  // ⚡ PERFORMANCE: Memoize date formatting (runs only when createdAt changes)
  const formattedDate = useMemo(
    () => new Date(customer.createdAt).toISOString().split("T")[0],
    [customer.createdAt]
  );

  // ⚡ PERFORMANCE: Memoize full name (runs only when names change)
  const fullName = useMemo(
    () => `${customer.firstName} ${customer.lastName}`,
    [customer.firstName, customer.lastName]
  );

  return (
    <div className="border border-b border-[#DAD9DE] p-[15px] bg-white relative">
      <div className="flex flex-col gap-[15px]">
        <div className="flex gap-9">
          <div className="flex flex-col gap-[5px]">
            <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">
              Date Registered
            </p>
            <p className="text-[12px]/[15px] text-[#434745] font-medium">
              {formattedDate}
            </p>
          </div>
          <div className="flex flex-col gap-[5px]">
            <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">
              Status
            </p>
            <Badge
              variant={isActive ? "success" : "destructive"}
              className="rounded-[15px] text-[11px]/[13px] font-semibold"
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-[5px]">
          <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">NIC</p>
          <p className="text-[12px]/[15px] text-[#434745] font-medium">
            {customer.nic}
          </p>
        </div>

        <div className="flex flex-col gap-[5px]">
          <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">
            Client Name
          </p>
          <p className="text-[12px]/[15px] text-[#434745] font-medium">
            {fullName}
          </p>
        </div>

        <div className="flex flex-col gap-[5px]">
          <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">
            Mobile Number
          </p>
          <p className="text-[12px]/[15px] text-[#434745] font-medium">
            {customer.mobileNumber}
          </p>
        </div>

        <div className="flex flex-col gap-[5px]">
          <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">Email</p>
          <p className="text-[12px]/[15px] text-[#434745] font-medium">
            {customer.email}
          </p>
        </div>
      </div>

      <div className="absolute right-0 inset-y-0 flex flex-col gap-[10px] items-center justify-center">
        <i
          onClick={() => {
            setIsClientProfileOpen(true);
          }}
          className="view-details w-[36.26px] h-[50px]"
        />
        <i
          onClick={() => {
            setIsUpdateOpen(true);
          }}
          className="edit-with-bg w-[36.26px] h-[50px]"
        />
        <button
          type="button"
          aria-label="Deactivate customer"
          onClick={() => {
            handleAction(
              async () => {
                const res = await deactivateCustomer(customer._id);
                setIsActive(false); // ✅ update state on success
                return res;
              },
              `Are you sure you want to deactivate this client?`,
              `The client has been successfully deactivated!`,
              "Deactivate",
              "Done",
              undefined,
              "red"
            );
          }}
          className="deactivate-customer w-[36.26px] h-[50px] bg-transparent border-none p-0"
        />

      </div>

      <ViewClientProfile
        isOpen={isClientProfileOpen}
        setIsOpen={setIsClientProfileOpen}
        customer={customer}
      />

      <AddNewMember
        open={isUpdateOpen}
        setOpen={setIsUpdateOpen}
        data={customer}
      />
    </div>
  );
});

// Set display name for debugging
IndividualCard.displayName = 'IndividualCard';

export default IndividualCard;