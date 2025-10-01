"use client";

import { Badge } from "@/components/ui/badge";
import { Status, Trainer } from "@/types/TrainerDetails";
import React, { useMemo } from "react";
import { SessionHistory } from "./SessionHistory";
import { TrainerRegistrationCard } from "./UpdateTrainer";
import { UserCancel } from "./UserCancel";

interface TrainerCardProps {
  trainer: Trainer;
  onDeactivate: (trainerId: string) => void;
}

// ⚡ PERFORMANCE OPTIMIZATION: Memoize to prevent unnecessary re-renders
const TrainerCard = React.memo(({ trainer, onDeactivate }: TrainerCardProps) => {
  // ⚡ PERFORMANCE: Memoize date formatting
  const formattedDate = useMemo(
    () => new Date(trainer.createdAt).toISOString().slice(0, 10),
    [trainer.createdAt]
  );

  // ⚡ PERFORMANCE: Memoize full name
  const fullName = useMemo(
    () => `${trainer.firstName} ${trainer.lastName}`,
    [trainer.firstName, trainer.lastName]
  );

  return (
    <div
      key={trainer._id}
      className="border border-b border-gray-200 p-2 bg-white relative"
    >
      <div className="flex mb-3">
        <div className="flex w-full gap-4">
          <div className="flex-1">
            <div className="text-[11px] text-[#363636] font-medium">
              Registered Date
            </div>
            <div className="text-[12px]">{formattedDate}</div>
          </div>
          <div className="flex-1">
            <div className="text-[11px] text-[#363636] font-medium">
              Type
            </div>
            <Badge
              variant={trainer.isFullTime ? "success" : "destructive"}
              className={`p-2 text-[11px] ${
                trainer.isFullTime
                  ? "bg-[#FBD8AD] text-[#BC4412] rounded-[15px] w-[71px] h-[18px]"
                  : "bg-[#B2FFB9] text-[#0A7117] rounded-[15px] w-[68px] h-[18px]"
              }`}
            >
              {trainer.isFullTime ? "Full time" : "Part time"}
            </Badge>
          </div>
          <div className="flex-1">
            <div className="text-[11px] text-[#363636] font-medium">
              Status
            </div>
            <Badge
              variant={
                trainer.status === Status.ACTIVE ? "success" : "destructive"
              }
              className="rounded-[15px] text-[11px]/[13px] font-semibold"
            >
              {trainer.status === Status.ACTIVE ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-[11px] text-[#6D6D6D]">Trainer Name</p>
          <p className="text-[12px] text-[#434745]">{fullName}</p>
        </div>
        <div>
          <p className="text-[11px] text-[#6D6D6D]">Trainer NIC</p>
          <p className="text-[12px] text-[#434745]">{trainer.nic}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-[11px] text-[#6D6D6D]">Trainer Phone</p>
          <p className="text-[12px] text-[#434745]">{trainer.mobile}</p>
        </div>
        <div>
          <p className="text-[11px] text-[#6D6D6D]">User ID</p>
          <p className="text-[12px] text-[#434745]">{trainer._id.slice(-6)}</p>
        </div>
      </div>

      <div className="absolute right-0 inset-y-0 flex flex-col gap-[10px] items-center justify-center pr-2">
        <TrainerRegistrationCard trainerId={trainer._id} />
        <SessionHistory trainerId={trainer._id} trainerName={fullName} />
        <UserCancel
          trainerId={trainer._id}
          onSuccess={() => onDeactivate(trainer._id)}
        />
      </div>
    </div>
  );
});

// Set display name for debugging
TrainerCard.displayName = 'TrainerCard';

export default TrainerCard;

