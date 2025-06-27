"use client";

import CustomPagination from "@/components/common/CustomPagination";
import CommonSearch from "@/components/common/Search";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useViewGroupDetails } from "@/hooks/useGroupDetailsSheet";
import { GroupShort } from "@/types/Customer";
import GroupCard from "./GroupCard";

const Group = ({
  groups,
}: {
  groups: { results: GroupShort[]; totalResults: number };
}) => {
  const { setOpenAddNewGroup, setOpenTransferMemberToAGroup } =
    useViewGroupDetails();

  return (
    <div className="w-full">
      <Card>
        <CardContent className="flex-col px-0">
          <div className="flex flex-col gap-[10px] mb-[15px] px-[15px]">
            <CommonSearch />

            <div className="flex gap-[10px] w-full">
              <Button
                onClick={() => {
                  setOpenTransferMemberToAGroup(true);
                }}
                className="bg-[#F04237] text-[9.62px] flex flex-1 items-center justify-center rounded-[23.48px]"
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

          {groups.results.map((group, index) => (
            <GroupCard key={index} group={group} />
          ))}
        </CardContent>
      </Card>

      <div className="text-center mt-5">
        <div className="text-[11px] text-[#3D3D3D] mb-1">
          Showing results {groups.results.length}/{groups.totalResults}
        </div>
        <div className="flex items-center justify-center">
          <CustomPagination
            totalCount={groups.totalResults}
            className="flex items-center justify-center gap-2 pt-2"
          />
        </div>
      </div>
    </div>
  );
};

export default Group;