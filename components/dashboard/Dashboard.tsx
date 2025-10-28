"use client";

import { useDailyAttendanceSheet } from "@/hooks/useDailyAttendanceSheet";
import { usePendingPaymentsSheet } from "@/hooks/usePendingPaymentsSheet";
import useUserDetails from "@/hooks/useUserDetails";
import React from "react";
import CollectPayment from "./CollectPayment";
import DailyAttendance from "./DailyAttendance";
import MarkAttendance from "./MarkAttendance";
import PendingPayments from "./PendingPayments";
import TotalEarningChart from "./TotalEarningsChart";
import UnpaidCustomers from "./UnpaidCustomers";
import WhiteCard from "./WhiteCard";

// Define types for the backend data
type DashboardData = {
  trainer: {
    partTime: number;
    fullTime: number;
  };
  client: {
    group: number;
    individual: number;
    pendingPayments: number;
  };
  paymentHistory: Array<{
    month: string;
    amount: number;
  }>;
};

type DashboardProps = {
  data: DashboardData;
  userName: string;
};

const Dashboard: React.FC<DashboardProps> = ({ data, userName }) => {
  // Destructure the data for easier access
  // ⚡ SAFETY: Ensure chartData is always an array
  const {
    trainer,
    client,
    paymentHistory
  } = data;
  
  const chartData = Array.isArray(paymentHistory) ? paymentHistory : [];
  
  const { setOpenDailyAttendanceSheet } = useDailyAttendanceSheet();
  const { setOpenPendingPaymentsSheet } = usePendingPaymentsSheet();
  const { user } = useUserDetails();
  const isAdmin = user?.isAdmin === true || user?.isAdmin === "true" || user?.isAdmin === 1;
  
  return (
    <div>
      <div className="flex flex-col gap-[20px]">
        {/* Welcome section */}
        <div>
          <h1 className="text-[14px]/[18.2px] font-semibold text-[#44424D]">
            Welcome {userName}
          </h1>
          <p className="text-[12.6px]/[12.6px] font-normal text-[#4F4F4F]">
            Let&apos;s get started
          </p>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-[10px]">
          <CollectPayment />
          <MarkAttendance />
        </div>

        {/* Clients card */}
        <WhiteCard className="flex flex-col gap-[10px] items-center">
          <div className="flex gap-[5px] w-full">
            <i className="total-client size-[18px] text-[#3D3D3D]" />
            <h1 className="text-[12px] font-medium text-[#3D3D3D]">
              Total Client
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-[12px] w-full">
            <div className="flex flex-col items-center justify-center bg-[#fac1be] rounded-[15px] h-[76px] gap-[6px]">
              <p className="text-[14px]/[18px] font-normal text-[#454545]">
                Group
              </p>
              <p className="text-[24px]/[18px] font-bold text-[#F04237]">
                {client.group}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center bg-[#fac1be] rounded-[15px] h-[76px] gap-[6px]">
              <p className="text-[14px]/[18px] font-normal text-[#454545]">
                Individual
              </p>
              <p className="text-[24px]/[18px] font-bold text-[#F04237]">
                {client.individual}
              </p>
            </div>
          </div>
        </WhiteCard>

        {/* Trainers card */}
        <WhiteCard className="flex flex-col gap-[10px] items-center">
          <div className="flex gap-[5px] w-full">
            <i className="total-client size-[18px] text-[#3D3D3D]" />
            <h1 className="text-[12px] font-medium text-[#3D3D3D]">Trainers</h1>
          </div>
          <div className="grid grid-cols-2 gap-[12px] w-full">
            <div className="flex flex-col items-center justify-center bg-[#fac1be] rounded-[15px] h-[76px] gap-[6px]">
              <p className="text-[14px]/[18px] font-normal text-[#454545]">
                Part Time
              </p>
              <p className="text-[24px]/[18px] font-bold text-[#3D3D3D]">
                {trainer.partTime}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center bg-[#fac1be] rounded-[15px] h-[76px] gap-[6px]">
              <p className="text-[14px]/[18px] font-normal text-[#454545]">
                Full Time
              </p>
              <p className="text-[24px]/[18px] font-bold text-[#3D3D3D]">
                {trainer.fullTime}
              </p>
            </div>
          </div>
        </WhiteCard>

        {/* Daily attendance card */}
        <WhiteCard className="flex flex-col gap-[10px] items-center">
          <div className="flex gap-[5px] w-full">
            <i className="calendar-icon size-[18px] text-[#3D3D3D]" />
            <h1 className="text-[12px] font-medium text-[#3D3D3D]">
              Daily Attendance
            </h1>
          </div>
          <button 
            onClick={() => setOpenDailyAttendanceSheet(true)}
            className="flex justify-center items-center bg-[#F8F9FA] w-full h-[76px] rounded-[15px] cursor-pointer hover:bg-[#E9ECEF] transition-colors border-none"
            type="button"
          >
            <div className="flex flex-col items-center gap-1">
              <i className="calendar-icon size-[24px] text-[#363636]" />
              <p className="text-[12px] font-medium text-[#363636]">
                View Attendance
              </p>
            </div>
          </button>
        </WhiteCard>

        {/* Pending payments card */}
        <WhiteCard className="flex flex-col gap-[10px] items-center">
          <div className="flex gap-[5px] w-full">
            <i className="total-client size-[18px] text-[#EB5F14]" />
            <h1 className="text-[12px] font-medium text-[#EB5F14]">
              Payment Pending&apos;s
            </h1>
          </div>
          <button
            onClick={() => setOpenPendingPaymentsSheet(true)}
            className="flex justify-center items-center bg-[#FEF7EE] w-full h-[76px] rounded-[15px] cursor-pointer hover:bg-[#FEE9D9] transition-colors border-none"
            type="button"
          >
            <div className="flex flex-col items-center gap-1">
              <p className="text-[24px] font-bold text-[#EB5F14]">
                {client.pendingPayments}
              </p>
              <p className="text-[10px] font-medium text-[#EB5F14] opacity-70">
                Click to view
              </p>
            </div>
          </button>
        </WhiteCard>

        {/* Earnings chart for admins, Unpaid customers for trainers */}
        {isAdmin ? (
          <TotalEarningChart chartData={chartData} />
        ) : (
          <UnpaidCustomers pendingPayments={client.pendingPayments} />
        )}
      </div>
      
      {/* Daily Attendance Sheet */}
      <DailyAttendance />
      
      {/* Pending Payments Sheet */}
      <PendingPayments />
    </div>
  );
};

export default Dashboard;