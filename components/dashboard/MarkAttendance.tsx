"use client";

import React from "react";
import WhiteCard from "./WhiteCard";
import { useMarkAttendanceIndividualSheet } from "@/hooks/useMarkAttendanceIndividualSheet";
import { useMarkAttendanceGroupSheet } from "@/hooks/useMarkAttendanceGroupSheet";

const MarkAttendance = () => {
  const { setOpenMarkAttendanceIndividualSheet } =
    useMarkAttendanceIndividualSheet();

  const { setOpenMarkAttendanceGroupSheet } = useMarkAttendanceGroupSheet();

  return (
    <WhiteCard className="flex flex-col gap-[10px] items-center">
      <i className="mark-attendance size-[25px] text-[#5D5D5D]" />
      <p className="text-[12px] font-medium text-[#5D5D5D]">Mark Attendance</p>
      <div className="grid grid-cols-2 gap-[10px] w-full">
        <div
          onClick={() => {
            setOpenMarkAttendanceIndividualSheet(true);
          }}
          className="flex flex-col items-center justify-between bg-[#E3F5E5] rounded-[15px] py-[18px] gap-[6px]"
        >
          <i className="individual-icon  w-[16.54px] h-[18.9px] text-[#000000]" />
          <p className="text-[13px] font-medium text-[#454545]">Individual</p>
        </div>
        <div
          onClick={() => {
            setOpenMarkAttendanceGroupSheet(true);
          }}
          className="flex flex-col items-center justify-between bg-[#E3F5E5] rounded-[15px] py-[18px] gap-[6px]"
        >
          <i className="group-icon w-[23.63px] h-[18.9px] text-[#000000]" />
          <p className="text-[13px] font-medium text-[#454545]">Group</p>
        </div>
      </div>
    </WhiteCard>
  );
};

export default MarkAttendance;
