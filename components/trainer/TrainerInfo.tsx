"use client";

import { getTrainers } from "@/actions/trainers";
import { trainersCache } from "@/lib/trainersCache";
import { Status, Trainer } from "@/types/TrainerDetails";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import TrainerCard from "./TrainerCard";
import TrainersSkeleton from "./TrainersSkeleton";

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
      
      {/* ⚡ PERFORMANCE: Use memoized TrainerCard component */}
      <div className="flex flex-col w-full max-w-md mx-auto">
        {trainers.map((trainer) => (
          <TrainerCard
            key={trainer._id}
            trainer={trainer}
            onDeactivate={handleTrainerDeactivated}
          />
        ))}
      </div>
    </div>
  );
};

export default TrainerList;
