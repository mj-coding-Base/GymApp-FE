"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSuccessModal } from "@/hooks/modals/useSuccessModal";
import { useViewGroupDetails } from "@/hooks/useGroupDetailsSheet";
import React from "react";

const TransferMemberToExistingGroup = () => {
  const {
    openTransferMemberToExistingGroup,
    setOpenTransferMemberToExistingGroup,
    setOpenTransferMemberToAGroup,
  } = useViewGroupDetails();
  const { setOpenSuccessModal, setSuccessData } = useSuccessModal();

  return (
    <Sheet
      open={openTransferMemberToExistingGroup}
      onOpenChange={setOpenTransferMemberToExistingGroup}
    >
      <SheetContent
        side="bottom"
        hideClose={true}
        className="rounded-t-2xl min-h-[600px] max-h-[calc(100%-40px)] px-[14px] pt-[14px] gap-5"
      >
        <SheetHeader className="hidden">
          <SheetTitle></SheetTitle>
        </SheetHeader>
        <button
          onClick={() => {
            setOpenTransferMemberToExistingGroup(false);
            setOpenTransferMemberToAGroup(true);
          }}
          className="flex gap-[10px]"
        >
          <i className="back-icon size-4 text-[#1D1B20]" />
          <h1 className="text-[13px]/[16px] font-medium text-[#363636] text-center">
            Transfer Member to Existing a Group
          </h1>
        </button>

        <div className="flex flex-col gap-[10px]">
          <p className="text-[12px]/[15px] text-[#212121] font-normal">
            Client
          </p>
          <div className="text-[13px]/[16px] font-normal text-[#454545] h-[40px] border-none bg-[#EFEEF0] rounded-[10px] content-center px-[14.22px]">
            Kusal Fernando
          </div>
        </div>

        <div className="flex flex-col gap-[10px]">
          <p className="text-[12px]/[15px] text-[#212121] font-normal">
            Select Group
          </p>
          <div className="relative w-full max-w-sm h-[40px]">
            <i className="search-icon  w-[16.54px] h-[18.9px] text-[#6D6D6D] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search by NIC / Name"
              className="pl-10 text-[11px] font-normal text-[#4F4F4F] h-[40px] border-[0.9px] border-[#6D6D6D]"
            />
          </div>
          <div className="flex flex-col gap-[9px] bg-[#F6F6F6] rounded-[10px] p-[14px]">
            <div className="flex flex-col gap-[4px]">
              <p className="text-[#454545] text-[13px]/[16px] font-medium">
                Member 1
              </p>
              <div className="flex">
                <p className="flex-1 text-[#454545] text-[13px]/[16px]">
                  Supun Kanishka
                </p>
                <p className="flex-1 text-[#454545] text-[13px]/[16px]">
                  2345678V
                </p>
                <p className="flex-1 text-[#454545] text-[13px]/[16px]">
                  +94123456789
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-[4px]">
              <p className="text-[#454545] text-[13px]/[16px] font-medium">
                Member 2
              </p>
              <div className="flex">
                <p className="flex-1 text-[#454545] text-[13px]/[16px]">
                  Supun Kanishka
                </p>
                <p className="flex-1 text-[#454545] text-[13px]/[16px]">
                  2345678V
                </p>
                <p className="flex-1 text-[#454545] text-[13px]/[16px]">
                  +94123456789
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-[4px]">
              <p className="text-[#454545] text-[13px]/[16px] font-medium">
                Member 3
              </p>
              <div className="flex">
                <p className="flex-1 text-[#454545] text-[13px]/[16px]">
                  Supun Kanishka
                </p>
                <p className="flex-1 text-[#454545] text-[13px]/[16px]">
                  2345678V
                </p>
                <p className="flex-1 text-[#454545] text-[13px]/[16px]">
                  +94123456789
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-[10px] flex-1">
          <p className="text-[12px]/[15px] text-[#212121] font-normal">
            Relationship
          </p>
          <Select>
            <SelectTrigger className="w-full rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]">
              <SelectValue
                placeholder="Select"
                className="placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="noRelation">1. No relation</SelectItem>
              <SelectItem value="husbandWife">2. Husband/Wife</SelectItem>
              <SelectItem value="brother">3. Brother</SelectItem>
              <SelectItem value="sister">4. Sister</SelectItem>
              <SelectItem value="friend">5. Friend</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-[15px] mb-5">
          <SheetClose asChild className="flex">
            <Button
              variant={"outline"}
              className="border-[#69716C] rounded-[10px] text-[11px]/[16px] font-semibold text-[#69716C] h-[40px] w-[127px]"
            >
              Cancel
            </Button>
          </SheetClose>
          <Button
            onClick={() => {
              setSuccessData({
                title: `Client Transferred to a Group!`,
                description: `The client has been successfully transferred to the group!`,
                backButtonText: "Done",
                function: () => {},
              });
              setOpenTransferMemberToExistingGroup(false);
              setOpenSuccessModal(true);
            }}
            type="button"
            className="bg-[#378644] rounded-[10px] text-[11px]/[16px] font-semibold text-[#FFFFFF] h-[40px] w-[127px]"
          >
            Submit
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TransferMemberToExistingGroup;