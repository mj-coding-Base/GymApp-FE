"use client";

import { getTrainers } from "@/actions/trainers";
import { Badge } from "@/components/ui/badge";
import { Status, Trainer } from "@/types/TrainerDetails";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
// import { PaymentHistory } from "./PaymentHistory";
// import { SessionHistory } from "./SessionHistory";
import { TrainerRegistrationCard } from "./UpdateTrainer";
import { UserCancel } from "./UserCancel";

const TrainerList: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrainers = async () => {
      setIsLoading(true);
      try {
        const data = await getTrainers();
        // Map or transform the data to match the expected Trainer type
        const mappedData = data.map((trainer: Trainer) => ({
          ...trainer,
          isFullTime: trainer.isFullTime ?? false,
          isAdmin: trainer.isAdmin ?? false,
          isActive: trainer.isActive ?? false,
        }));
        setTrainers(mappedData);
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
      trainer._id === deactivatedId 
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
          key={trainer._id}
          className="border-b border-gray-200 p-4 bg-white relative"
        >
          <div className="flex mb-3">
            <div className="flex w-full gap-4">
              <div className="flex-1">
                <div className="text-[11px] text-[#363636] font-medium">
                  Registered Date
                </div>
                <div className="text-[12px]">{String(trainer.createdAt).slice(0, 10)}</div>
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
                  variant={trainer.status ? "success" : "destructive"}
                  className={`p-2 text-[11px] ${
                    trainer.status === Status.ACTIVE
                      ? "bg-[#F04237] text-[#BC4412] rounded-[15px] w-[54px] h-[18px]"
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
                  alt={trainer.firstName}
                />
                <AvatarFallback>{trainer.firstName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-[11px] text-[#363636] font-medium">
                  Trainer Name
                </div>
                <div className="text-[12px]">{trainer.firstName} {trainer.lastName}</div>
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
          {/* <PaymentHistory 
            trainerType={trainer.type} 
            trainerId={trainer.id} 
          />
          <SessionHistory 
            trainerType={trainer.type} 
            trainerId={trainer.id} 
          /> */}
          <UserCancel 
            trainerId={trainer._id} 
            onDeactivate={() => handleTrainerDeactivated(trainer._id)}
          />
        </div>
      ))}
    </div>
  );
};

export default TrainerList;
