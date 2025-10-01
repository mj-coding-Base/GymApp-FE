"use client";

import { getTrainers } from "@/actions/trainers";
import { Badge } from "@/components/ui/badge";
import { trainersCache } from "@/lib/trainersCache";
import { Status, Trainer } from "@/types/TrainerDetails";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { SessionHistory } from "./SessionHistory";
import TrainersSkeleton from "./TrainersSkeleton";
import { TrainerRegistrationCard } from "./UpdateTrainer";
import { UserCancel } from "./UserCancel";

const TrainerList: React.FC = () => {
  // Initialize with cached data immediately for instant load!
  const [trainers, setTrainers] = useState<Trainer[]>(() => {
    return trainersCache.get() || [];
  });
  const [isLoading, setIsLoading] = useState(() => {
    // Only show loading if no cache exists
    return !trainersCache.get();
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchTrainers = async () => {
      const hasCache = trainersCache.get() !== null;
      
      if (hasCache) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const data = await getTrainers();
        setTrainers(data);
        // Cache the fresh data
        trainersCache.set(data);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Failed to load trainers: ${error.message}`);
          console.error(error);
        } else {
          toast.error("Failed to load trainers");
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
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
    return <TrainersSkeleton />;
  }
  console.log(getTrainers)
  return (
    <div className="relative">
      {/* Show subtle loading indicator when refreshing in background */}
      {isRefreshing && (
        <div className="absolute top-0 right-0 z-10">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
            <i className="loading-icon size-[14px] animate-spin" />
            <span className="text-xs text-gray-600">Updating...</span>
          </div>
        </div>
      )}
      
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
                <div className="text-[12px]">{new Date(trainer.createdAt).toISOString().slice(0, 10)}</div>
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
                  variant={trainer.isActive ? "success" : "destructive"}
                  className={`p-2 text-[11px] ${
                    trainer.isActive 
                      ? "bg-[#B2FFB9] text-[#0A7117] rounded-[15px] w-[54px] h-[18px]"
                      : "bg-[#D32F2F] text-[#FFFFFF] rounded-[15px] w-[63px] h-[19px]"
                  }`}
                >
                  {trainer.isActive ? "Active":"not active"} 
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3 ">
            <div className="flex items-center gap-3 mt-1 ">
              {/* <Avatar className="h-[36px] w-[36px] rounded-[12px]">
                <AvatarImage
                  src={trainer.profileImage || "/images/trainer.png"}
                  alt={trainer.firstName}
                />
                <AvatarFallback>{trainer.firstName.charAt(0)}</AvatarFallback>
              </Avatar> */}
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
            
            <div className="flex flex-wrap items-start gap-x-6 gap-y-2 mt-1">
              <div>
                <div className="text-[11px] text-[#363636] font-medium mb-1">
                  Email
                </div>
                <div className="text-[12px]">
                  {trainer.email}
                </div>
              </div>


            </div>
              <div>
                <div className="text-[11px] text-[#363636] font-medium mb-1">
                  Mobile
                </div>
                <div className="text-[12px]">
                  {trainer.mobile}
                </div>
              </div>
          </div>

          <TrainerRegistrationCard />
          {/* <PaymentHistory 
            trainerId={trainer._id} 
          /> */}
          <SessionHistory 
            trainerId={trainer._id}
            trainerName={trainer.firstName} 
          />
          <UserCancel 
            trainerId={trainer._id} 
            onDeactivate={() => handleTrainerDeactivated(trainer._id)}
          />
        </div>
      ))}
    </div>
    </div>
  );
};

export default TrainerList;
