import React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useSuccessModal } from "@/hooks/modals/useSuccessModal";
import { cn } from "@/lib/utils";

const SuccessModal = () => {
  const { openSuccessModal, successData, setOpenSuccessModal, setSuccessData } =
    useSuccessModal();

  const handleClose = () => {
    setOpenSuccessModal(false);
    setSuccessData({
      title: "",
      backButtonText: "",
      function: () => {},
    });
  };

  return (
    <Dialog
      open={openSuccessModal}
      onOpenChange={() => {
        successData.function();
        handleClose();
      }}
    >
      <DialogContent
        className={cn(
          "p-[15px] w-[370px] max-w-full flex flex-col items-center gap-[12px]",
          successData.description && "rounded-[10px] w-[313px]"
        )}
      >
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <i className="success-icon size-[55px] text-[#4CAF50] mx-auto mt-[15px]" />
        <div className="flex flex-col gap-[2px]">
          <p
            className={cn(
              "text-center text-[#757575] font-semibold text-sm text-wrap"
            )}
          >
            {successData.title}
          </p>
          {successData.description && successData.description !== "null" && (
            <p className="text-center text-gray/70 text-[13px]/[16px] text-wrap text-[#757575]">
              {successData.description}
            </p>
          )}
        </div>
        <Button
          className={cn(
            "w-full bg-[#4CAF50] text-white h-[39px] font-medium text-[13px]/[15px] rounded-[8px]"
          )}
          onClick={() => {
            successData.function();
            handleClose();
          }}
        >
          {successData.backButtonText}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
