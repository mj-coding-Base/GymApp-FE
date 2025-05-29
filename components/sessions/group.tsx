import React from "react";
import { useMarkAttendanceGroupSheet } from "@/hooks/useMarkAttendanceGroupSheet";
import { GroupSessionHistory } from "./groupSessionHistory";
import { Button } from "../ui/button";
import { Customer } from "@/types/Customer";

interface GroupSessionsProps {
  members: Customer[];
}

const GroupSessions = ({ members }: GroupSessionsProps) => {
  const { setOpenMarkAttendanceGroupSheet } = useMarkAttendanceGroupSheet();
  return (
    <div>
      <div className="px-3">
        <Button
          onClick={() => {
            setOpenMarkAttendanceGroupSheet(true);
          }}
          className="w-full mt-1 rounded-[23.8px] h-[36.6px] mb-3 bg-[#44424D] hover:bg-[#44424D] text-white text-[9.62px]"
        >
          <i className="add-people-icon bg-[#FFFFFF] h-[12px] w-[11.5px] mr-2"></i>{" "}
          Mark Attendance
        </Button>
      </div>
      {members.map((member) => (
        <div
          key={member._id}
          className="border border-b border-gray-200 p-3 pr-0 bg-white relative"
        >
          <div className="text-[10px] text-[#6D6D6D] ">Session Date</div>
          <div className="mb-2 text-[12px] text-[#434745]">
            {new Date(member.createdAt).toISOString().split('T')[0]}
          </div>

          <div className="text-[10px] text-[#6D6D6D] ">Group Member</div>
          <div className="relative">
            <div className="text-[12px] text-[#434745]">
                {(member.groupMembersNames?.join(',  ')) || ''}
              </div>

            <GroupSessionHistory groupId={member._id} />
          </div>

          <div className="flex justify-between gap-8">
            <div className="w-1/4">
              <div className="text-[10px] text-[#6D6D6D]">NIC</div>
              <div className="text-[12px] text-[#434745]">{member.nic}</div>
            </div>
            <div className="w-3/4">
              <div className="text-[10px] text-[#6D6D6D] ">Current Session</div>
              <div className="text-[12px] text-[#434745]">
                {member.currentSession}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupSessions;
