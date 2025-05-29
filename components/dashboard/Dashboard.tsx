import React from "react";
import WhiteCard from "./WhiteCard";
import TotalEarningChart from "./TotalEarningsChart";
import CollectPayment from "./CollectPayment";
import MarkAttendance from "./MarkAttendance";

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
  const {
    trainer,
    client,
    paymentHistory: chartData
  } = data;
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
            <div className="flex flex-col items-center justify-center bg-[#E3F5E5] rounded-[15px] h-[76px] gap-[6px]">
              <p className="text-[14px]/[18px] font-normal text-[#454545]">
                Group
              </p>
              <p className="text-[24px]/[18px] font-bold text-[#00BC15]">
                {client.group}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center bg-[#E3F5E5] rounded-[15px] h-[76px] gap-[6px]">
              <p className="text-[14px]/[18px] font-normal text-[#454545]">
                Individual
              </p>
              <p className="text-[24px]/[18px] font-bold text-[#00BC15]">
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
            <div className="flex flex-col items-center justify-center bg-[#F3FAF4] rounded-[15px] h-[76px] gap-[6px]">
              <p className="text-[14px]/[18px] font-normal text-[#454545]">
                Part Time
              </p>
              <p className="text-[24px]/[18px] font-bold text-[#3D3D3D]">
                {trainer.partTime}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center bg-[#F3FAF4] rounded-[15px] h-[76px] gap-[6px]">
              <p className="text-[14px]/[18px] font-normal text-[#454545]">
                Full Time
              </p>
              <p className="text-[24px]/[18px] font-bold text-[#3D3D3D]">
                {trainer.fullTime}
              </p>
            </div>
          </div>
        </WhiteCard>

        {/* Pending payments card */}
        <WhiteCard className="flex flex-col gap-[10px] items-center">
          <div className="flex gap-[5px] w-full">
            <i className="total-client size-[18px] text-[#EB5F14]" />
            <h1 className="text-[12px] font-medium text-[#EB5F14]">
              Payment Pending&apos;s
            </h1>
          </div>
          <div className="flex justify-center items-center bg-[#FEF7EE] w-full h-[76px] rounded-[15px]">
            <p className="text-[24px] font-bold text-[#EB5F14]">
              {client.pendingPayments}
            </p>
          </div>
        </WhiteCard>

        {/* Earnings chart - properly passed with TypeScript props */}
        <TotalEarningChart chartData={chartData} />
      </div>
    </div>
  );
};

export default Dashboard;