"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useViewGroupDetails } from "@/hooks/useGroupDetailsSheet";
import React, { useEffect, useState } from "react";
import GroupDetailsCard from "./GroupDetailsCard";
import { GroupFull } from "@/types/Customer";
import { fetchGroupCustomers } from "@/actions/customers";
import { useGroupDetailsStore } from "@/hooks/useGroupDetailsStore";
import { ErrorToast } from "@/components/common/toast";
import { Loader2 } from "lucide-react";

const ViewGroupDetails = () => {
  const [loadingData, setLoadingData] = useState(false);
  const [group, setCustomers] = useState<GroupFull>();

  const { openViewGroupDetails, setOpenViewGroupDetails } =
    useViewGroupDetails();
  const { selectedGroupData } = useGroupDetailsStore();

  const fetchPackages = async () => {
    try {
      setLoadingData(true);
      const res = await fetchGroupCustomers(
        "1",
        "10",
        undefined,
        selectedGroupData?? '',
        undefined
      );
      console.log(res);
      setCustomers(res.results);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      ErrorToast("Failed to fetch data");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (openViewGroupDetails) {
      fetchPackages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openViewGroupDetails]);

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

        {loadingData ? (
          <div className="p-2 text-center">
            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            Loading packages...
          </div>
        ) : (
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
                {selectedGroupData}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="border-[#E0E0E0] border-[1px] rounded-[15px] overflow-hidden w-full">
                {group && Array.isArray(group.members) && group.members.length > 0 ? (
                  group.members.map((member, index) => (
                    <GroupDetailsCard key={index} groupMember={member} />
                  ))
                ) : (
                  <div>no data</div>
                )}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ViewGroupDetails;