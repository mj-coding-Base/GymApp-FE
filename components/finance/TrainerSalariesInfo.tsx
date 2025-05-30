import { getTrainerSalaries } from "@/actions/finances";
import { Badge } from "@/components/ui/badge";
import { ClientType, Status } from "@/types/TrainerSalaries";
import React from "react";

export const TrainerSalariesInfo: React.FC = async () => {
  const result = await getTrainerSalaries();
  const salaries = result.data;

  return (
    <div className="flex flex-col">
      {salaries.map((salary) => (
        <div key={salary.id} className="border border-gray-200  bg-white pb-2 pt-2 px-4">
          <div className="gap-12 flex">
            <div className="">
              <div className="text-[11px] text-[#6D6D6D]">Date</div>
              <div className="text-[13px] text-[#434745]">{salary.date}</div>
            </div>
            <div className="">
              <div className="text-[11px] text-[#6D6D6D]">Trainer Name</div>
              <div className="text-[13px] text-[#434745]">
                {salary.trainerName}
              </div>
            </div>
          </div>

          <div className="flex gap-11 mb-2">
            <div className="">
              <div className="text-[11px] text-[#6D6D6D]">Total Salary</div>
              <div className="text-[13px] text-[#434745]">
                {salary.totalSalary}
              </div>
            </div>
            <div className="">
              <div className="text-[11px] text-[#6D6D6D]">Current Session</div>
              <div className="text-[13px] text-[#434745]">
                {salary.currentSession}
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            <div className="">
              <div className="text-[11px] text-[#6D6D6D]">Type</div>
              <div>
                <Badge
                  className={`mt-1 px-3 py-1 ${
                    salary.type === ClientType.PART_TIME
                      ? "bg-[#FBD8AD] text-[#BC4412] w-[71px] h-[18px]"
                      : "bg-[#B2FFB9] text-[#0A7117] w-[68px] h-[19px]"
                  }  text-[11px] rounded-[15px] font-[600]`}
                >
                  {salary.type}
                </Badge>
              </div>
            </div>
            <div className="">
              <div className="text-[11px] text-[#6D6D6D]">Status</div>
              <div>
                <Badge
                  className={`mt-1 px-3 py-1 ${
                    salary.status === Status.PAID
                      ? "bg-[#F04237] text-[#FFFFFF] w-[44px] h-[18px]"
                      : "bg-[#D32F2F] text-[#FFFFFF] w-[65px] h-[18px]"
                  } rounded-[15px] text-[11px] font-[600]`}
                >
                  {salary.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrainerSalariesInfo;