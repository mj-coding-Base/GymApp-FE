"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Type, Status, Trainer } from "@/types/TrainerDetails";
import { TrainerRegistrationCard } from "./UpdateTrainer";
import { PaymentHistory } from "./PaymentHistory";
import { SessionHistory } from "./SessionHistory";
import { UserCancel } from "./UserCancel";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getTrainers } from "@/actions/trainers";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const TrainerList: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrainers = async () => {
      setIsLoading(true);
      try {
        const data = await getTrainers();
        setTrainers(data);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Failed to load trainers: ${error.message}`);
          console.error(error);
        } else {
          toast.error("Failed to load trainers");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  const handleTrainerDeactivated = (deactivatedId: string) => {
    setTrainers(prev => prev.map(trainer => 
      trainer.id === deactivatedId 
        ? { ...trainer, status: Status.INACTIVE } 
        : trainer
    ));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-md mx-auto">
      {trainers.map((trainer) => (
        <div
          key={trainer.id}
          className="border-b border-gray-200 p-4 bg-white relative"
        >
          <div className="flex mb-3">
            <div className="flex w-full gap-4">
              <div className="flex-1">
                <div className="text-[11px] text-[#363636] font-medium">
                  Registered Date
                </div>
                <div className="text-[12px]">{trainer.registeredDate}</div>
              </div>
              <div className="flex-1">
                <div className="text-[11px] text-[#363636] font-medium">
                  Type
                </div>
                <Badge
                  className={`p-2 text-[11px] ${
                    trainer.type === Type.PART_TIME
                      ? "bg-[#FBD8AD] text-[#BC4412] rounded-[15px] w-[71px] h-[18px]"
                      : "bg-[#B2FFB9] text-[#0A7117] rounded-[15px] w-[68px] h-[18px]"
                  }`}
                >
                  {trainer.type}
                </Badge>
              </div>
              <div className="flex-1">
                <div className="text-[11px] text-[#363636] font-medium">
                  Status
                </div>
                <Badge
                  className={`p-2 text-[11px] ${
                    trainer.status === Status.ACTIVE
                      ? "bg-[#00BC15] text-[#FFFFFF] rounded-[15px] w-[54px] h-[18px]"
                      : "bg-[#D32F2F] text-[#FFFFFF] rounded-[15px] w-[63px] h-[19px]"
                  }`}
                >
                  {trainer.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 mt-1">
              <Avatar className="h-[36px] w-[36px] rounded-[12px]">
                <AvatarImage
                  src={trainer.profileImage || "/images/trainer.png"}
                  alt={trainer.trainerName}
                />
                <AvatarFallback>{trainer.trainerName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-[11px] text-[#363636] font-medium">
                  Trainer Name
                </div>
                <div className="text-[12px]">{trainer.trainerName}</div>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#363636] font-medium">NIC</div>
              <div className="text-[12px]">{trainer.nic}</div>
            </div>

            <div>
              <div className="text-[11px] text-[#363636] font-medium">
                Email
              </div>
              <div className="text-[12px]">{trainer.email}</div>
            </div>

            <div>
              <div className="text-[11px] text-[#363636] font-medium">
                Mobile
              </div>
              <div className="text-[12px]">{trainer.mobile}</div>
            </div>
          </div>

          <TrainerRegistrationCard />
          <PaymentHistory 
            trainerType={trainer.type} 
            trainerId={trainer.id} 
          />
          <SessionHistory 
            trainerType={trainer.type} 
            trainerId={trainer.id} 
          />
          <UserCancel 
            trainerId={trainer.id} 
            onDeactivate={() => handleTrainerDeactivated(trainer.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default TrainerList;
