"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useViewGroupDetails } from "@/hooks/useGroupDetailsSheet";
import React from "react";
import GroupDetailsCard from "./GroupDetailsCard";
import { GroupMemberData } from "@/types/Group";

const groups: GroupMemberData[] = [
  {
    dateRegistered: "06/03/25",
    status: "active",
    nic: "988826355V",
    member: "Pathum Nirmal",
    mobileNumber: "+94716625345",
    relationship: "Primary Member",
    paymentStatus: "paid",
  },
  {
    dateRegistered: "06/03/25",
    status: "active",
    nic: "988826355V",
    member: "Pathum Nirmal",
    mobileNumber: "+94716625345",
    relationship: "Father",
    paymentStatus: "notPaid",
  },
  {
    dateRegistered: "06/03/25",
    status: "active",
    nic: "988826355V",
    member: "Pathum Nirmal",
    mobileNumber: "+94716625345",
    relationship: "Father",
    paymentStatus: "notPaid",
  },
];

const ViewGroupDetails = () => {
  const { openViewGroupDetails, setOpenViewGroupDetails } =
    useViewGroupDetails();

  return (
    <Sheet open={openViewGroupDetails} onOpenChange={setOpenViewGroupDetails}>
      <SheetContent
        side="bottom"
        hideClose={true}
        className="rounded-t-2xl h-[90vh] max-h-[calc(100%-40px)] px-[14px] pt-[14px] flex flex-col"
      >
        <SheetHeader className="hidden">
          <SheetTitle></SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full overflow-hidden">
          <SheetClose className="flex gap-[5px]">
            <i className="back-icon size-4 text-[#1D1B20]" />
            <p className="text-[11.2px]/[14px]">Back</p>
          </SheetClose>

          <h1 className="text-[14.4px]/[17px] font-medium text-[#363636] text-center">
            Group Details
          </h1>

          <div className="border-[0.8px] border-[#000000] rounded-[9.6px] overflow-hidden h-[38.4px] inline-flex items-center justify-center gap-[10.4px] w-fit px-[12.2px] mx-auto my-[15px]">
            <p className="text-[#6D6D6D] text-[11.44px]/[14px] font-medium">
              Package
            </p>
            <p className="text-[#3D3D3D] text-[11.44px]/[14px] font-semibold">
              BoxFit Extreme
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="border-[#E0E0E0] border-[1px] rounded-[15px] overflow-hidden w-full">
              {groups.map((group, index) => (
                <GroupDetailsCard key={index} groupMember={group} />
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ViewGroupDetails;
