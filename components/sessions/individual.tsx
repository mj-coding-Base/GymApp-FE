import React from "react";
import { IndividualSessionHistory } from "./individualSessioHistory";
import { Button } from "../ui/button";
import { useMarkAttendanceIndividualSheet } from "@/hooks/useMarkAttendanceIndividualSheet";
import { Customer } from "@/types/Customer";

interface IndividualSessionsProps {
  clients: Customer[];
}

const IndividualSessions = ({ clients}: IndividualSessionsProps) => {
  const { setOpenMarkAttendanceIndividualSheet } = useMarkAttendanceIndividualSheet();

  // Format date consistently
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  return (
    <div className="space-y-3">
      <div className="px-3">
        <Button
          onClick={() => setOpenMarkAttendanceIndividualSheet(true)}
          className="w-full mt-1 rounded-[23.8px] h-[36.6px] mb-3 bg-[#44424D] hover:bg-[#44424D] text-white text-[9.62px]"
        >
          <i className="add-people-icon bg-[#FFFFFF] h-[12px] w-[11.5px]" />
          Mark Attendance
        </Button>
      </div>
      
      {clients.map((client) => (
        <div
          key={client._id}
          className="border border-b border-gray-200 p-3 pr-0 bg-white relative"
        >
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <div className="text-[10px] text-[#6D6D6D]">Session Date</div>
              <div className="text-[12px] text-[#434745]">
                {formatDate(client.createdAt)}
              </div>
            </div>
            
            <div>
              <div className="text-[10px] text-[#6D6D6D]">Client ID</div>
              <div className="text-[12px] text-[#434745] truncate">
                {client._id}
              </div>
            </div>
          </div>

          <div className="mb-2">
            <div className="text-[10px] text-[#6D6D6D]">Client Name</div>
            <div className="relative">
              <div className="text-[12px] text-[#434745]">{client.name}</div>
              <IndividualSessionHistory 
                clientId={client._id} // Pass clientId to fetch specific sessions
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] text-[#6D6D6D]">NIC</div>
              <div className="text-[12px] text-[#434745]">
                {client.nic || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#6D6D6D]">Current Session</div>
              <div className="text-[12px] text-[#434745]">
                {client.currentSession || 0}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IndividualSessions;