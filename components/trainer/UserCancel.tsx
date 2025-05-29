"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { deactivateTrainer } from "@/actions/trainers";

interface UserCancelProps {
  trainerId: string;
  onDeactivate?: () => void;
}

export function UserCancel({ trainerId, onDeactivate }: UserCancelProps) {
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeactivate = async () => {
    setIsSubmitting(true);
    try {
      const result = await deactivateTrainer(trainerId);
      
      if (result.status === "SUCCESS") {
        setShowSuccess(true);
        onDeactivate?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    setShowSuccess(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="absolute right-0 top-50">
        <button
          onClick={() => setOpen(true)}
          className="w-[35px] h-[50px] bg-gray-100 rounded-tl-[30px] rounded-bl-[30px] flex items-center justify-center"
        >
          <i className="user-cancel-icon size-[20.5px]" />
        </button>
      </div>
      
      <DialogContent className="w-[313px] h-[207px] rounded-[10px] sm:rounded-[10px] px-1">
        {!showSuccess ? (
          <>
            <div className="">
              <DialogHeader className="flex flex-col items-center justify-center text-center">
                <AlertTriangle className="h-14 w-14 text-red-500 mb-1" />
                <DialogTitle className="text-[13px] justify-center text-center text-[#757575] px-4">
                  Are you sure you want to deactivate this trainer?
                </DialogTitle>
              </DialogHeader>
            </div>
            
            <DialogFooter className="flex flex-row items-center justify-center gap-3 sm:justify-center mt-1">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-[134px] h-[39px] border-[#5D5D5D]"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeactivate}
                className="w-[134px] h-[39px] bg-red-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Deactivate"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-3">  
            <div className="p-1 mb-1">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <p className="text-center text-[13px] mb-3 px-4 text-[#757575]">
              The trainer has been successfully deactivated!
            </p>
            <Button 
              onClick={handleDone}
              className="w-[283px] h-[39px] bg-green-600"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}