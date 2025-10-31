"use client";

import { useDailyAttendanceSheet } from "@/hooks/useDailyAttendanceSheet";
import { usePendingPaymentsSheet } from "@/hooks/usePendingPaymentsSheet";
import useUserDetails from "@/hooks/useUserDetails";
import React from "react";
import CollectPayment from "./CollectPayment";
import DailyAttendance from "./DailyAttendance";
import MarkAttendance from "./MarkAttendance";
import PendingPayments from "./PendingPayments";
import TodayAttendance from "./TodayAttendance";
import TotalEarningChart from "./TotalEarningsChart";
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
  const { user, refresh: refreshUser } = useUserDetails();
  
  // Debug: Log user data AND check cookie directly
  React.useEffect(() => {
    console.log('=== DASHBOARD DEBUG ===');
    console.log('Full user object:', JSON.stringify(user, null, 2));
    console.log('user?.isAdmin:', user?.isAdmin, 'Type:', typeof user?.isAdmin);
    console.log('user?.isFullTime:', user?.isFullTime, 'Type:', typeof user?.isFullTime);
    console.log('All user keys:', user ? Object.keys(user) : 'User is null/undefined');
    
    // Also check cookie directly
    if (typeof document !== 'undefined') {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('user-details='))
        ?.split('=')[1];
      if (cookieValue) {
        try {
          const cookieUser = JSON.parse(decodeURIComponent(cookieValue));
          console.log('Cookie user-details:', JSON.stringify(cookieUser, null, 2));
          console.log('Cookie isAdmin:', cookieUser?.isAdmin);
          console.log('Cookie isFullTime:', cookieUser?.isFullTime);
        } catch (e) {
          console.error('Error parsing cookie:', e);
        }
      }
    }
    console.log('======================');
    
    // If user exists but isFullTime is missing, try to refresh
    if (user?.isAdmin !== undefined && user?.isFullTime === undefined) {
      console.warn('isFullTime is missing from user object, refreshing...');
      refreshUser();
    }
  }, [user, refreshUser]);
  
  // More robust checks - handle boolean, string, number, and case variations
  // Also check for different property name variations
  const isAdminRaw = user?.isAdmin ?? user?.IsAdmin ?? user?.is_admin;
  const isFullTimeRaw = user?.isFullTime ?? user?.IsFullTime ?? user?.is_full_time ?? user?.isFulltime;
  
  const isAdmin = isAdminRaw === true || 
                 isAdminRaw === "true" || 
                 isAdminRaw === "True" || 
                 isAdminRaw === "TRUE" ||
                 isAdminRaw === 1 ||
                 String(isAdminRaw || '').toLowerCase() === 'true';
  
  const isFullTime = isFullTimeRaw === true || 
                     isFullTimeRaw === "true" || 
                     isFullTimeRaw === "True" || 
                     isFullTimeRaw === "TRUE" ||
                     isFullTimeRaw === 1 ||
                     String(isFullTimeRaw || '').toLowerCase() === 'true';
  
  // Debug: Log computed values - ALWAYS log
  React.useEffect(() => {
    console.log('=== COMPUTED VALUES ===');
    console.log('isAdmin (computed):', isAdmin);
    console.log('isFullTime (computed):', isFullTime);
    console.log('showTotalEarningChart:', isAdmin && isFullTime);
    console.log('showFullTimeComponents:', isFullTime);
    console.log('showTodayAttendance:', !isAdmin && !isFullTime);
    console.log('========================');
  }, [isAdmin, isFullTime]);
  
  // Permission-based component visibility
  // TotalEarningChart: only if isAdmin == true && isFullTime == true
  const showTotalEarningChart = isAdmin && isFullTime;
  
  // CollectPayment, MarkAttendance, PendingPayments: if isFullTime == true
  const showFullTimeComponents = isFullTime;
  
  // Today Attendance: if isAdmin == false && isFullTime == false
  const showTodayAttendance = !isAdmin && !isFullTime;
  
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

        {/* CollectPayment and MarkAttendance - only show if isFullTime == true */}
        {/* DEBUG: showFullTimeComponents = {String(showFullTimeComponents)}, isFullTime = {String(isFullTime)} */}
        {showFullTimeComponents && (
          <div className="grid grid-cols-2 gap-[10px]">
            <CollectPayment />
            <MarkAttendance />
          </div>
        )}

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

        {/* Today Attendance - only show if user is NOT admin AND NOT fullTime */}
        {showTodayAttendance && <TodayAttendance />}

        {/* Trainers card - only show if isFullTime == true */}
        {showFullTimeComponents && (
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
        )}

        {/* Daily attendance card - only show if isFullTime == true */}
        {showFullTimeComponents && (
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
        )}

        {/* Pending payments card - only show if isFullTime == true */}
        {showFullTimeComponents && (
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
        )}

        {/* TotalEarningChart - only show if isAdmin == true && isFullTime == true */}
        {/* DEBUG: showTotalEarningChart = {String(showTotalEarningChart)}, isAdmin = {String(isAdmin)}, isFullTime = {String(isFullTime)} */}
        {showTotalEarningChart && (
          <TotalEarningChart chartData={chartData} />
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