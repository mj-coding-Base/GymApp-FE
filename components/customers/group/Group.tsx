"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React from "react";
import GroupCard from "./GroupCard";
import { useViewGroupDetails } from "@/hooks/useGroupDetailsSheet";
import CustomPagination from "@/components/common/CustomPagination";
import{ FetchedGroupCustomer} from "@/types/Customer";



const Group = ( { groups }: { groups: FetchedGroupCustomer[] } ) => {
  const { setOpenAddNewGroup, setOpenTransferMemberToAGroup } =
    useViewGroupDetails();

  return (
    <div className="w-full">
      <Card>
        <CardContent className="flex-col px-0">
          <div className="flex flex-col gap-[10px] mb-[15px] px-[15px]">
            <div className="relative flex-1">
              <i className="search-icon absolute left-3 top-2 size-[19.12px] text-[#9E9E9E]" />
              <Input
                className="pl-[40px] pr-4 rounded-[24px] text-[#9E9E9E] text-[12px] border-[#9E9E9E] border-[0.8px]"
                placeholder="Search by Full name/ NIC"
              />
            </div>
            <div className="flex gap-[10px] w-full">
              <Button
                onClick={() => {
                  setOpenTransferMemberToAGroup(true);
                }}
                className="bg-[#00BC15] text-[9.62px] flex flex-1 items-center justify-center rounded-[23.48px]"
              >
                <i className="plus-icon bg-[#44424D] text-[#FFFFFF] h-[15.4px] w-[15.4px]" />
                <p className="text-[9.62px]/[16.68px]">Transfer To A Group</p>
              </Button>
              <Button
                onClick={() => {
                  setOpenAddNewGroup(true);
                }}
                className="bg-[#44424D] text-[9.62px] flex flex-1 items-center justify-center rounded-[23.48px]"
              >
                <i className="plus-icon bg-[#44424D] text-[#FFFFFF] h-[15.4px] w-[15.4px]" />
                <p className="text-[9.62px]/[16.68px]">Add New Group</p>
              </Button>
            </div>
          </div>

          {groups.map((group, index) => (
            <GroupCard key={index} group={group} />
          ))}
        </CardContent>
      </Card>

      <div className="text-center mt-5">
        <div className="text-[11px] text-[#3D3D3D] mb-1">
          Showing results 13/500
        </div>
        <div className="flex items-center justify-center">
          <CustomPagination
            totalCount={500}
            className="flex items-center justify-center gap-2 pt-2"
          />
        </div>
      </div>
    </div>
  );
};

export default Group;
