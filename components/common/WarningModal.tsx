"use client"
import React, { useState } from "react";

import { Loader2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWarningModal } from "@/hooks/modals/useWarningModal";
import { cn } from "@/lib/utils";
import { DialogTitle } from "@radix-ui/react-dialog";

const WarningModal = () => {
  const [loading, setLoading] = useState(false);

  const { openWarningModal, WarningData, setOpenWarningModal, setWarningData } =
    useWarningModal();

  const handleClose = () => {
    if (loading) return;

    setOpenWarningModal(false);
    setWarningData({
      title: "",
      description: "",
      backButtonText: "",
      function: () => {},
    });
  };

  return (
    <Dialog open={openWarningModal} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "p-[15px] w-[313px] max-w-full flex flex-col items-center gap-[17px]",
          WarningData.description && "gap-[10px] rounded-[20px] w-[313px]"
        )}
      >
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <i
          className={cn(
            "warning-modal-icon size-[50px] text-[#FDB528] mx-auto mt-[10px]",
            WarningData.color === "red" && "text-[#FF3B30]"
          )}
        />
        {WarningData.description && (
          <h2 className="text-center font-bold text-[#4c4847] text-[15px] text-wrap">
            {WarningData.description}
          </h2>
        )}
        <p
          className={cn(
            "text-center font-normal text-sm text-wrap text-[#757575]",
            WarningData.description && "text-[#72686A]"
          )}
        >
          {WarningData.title}
        </p>
        <div className="grid grid-cols-2 gap-2.5 w-full">
          <Button
            disabled={loading}
            variant="outline"
            className="w-full h-[39px] text-[13px]/[15px] font-medium border-[#616161] text-[#616161] rounded-[8px]"
            onClick={() => {
              if (WarningData.cancelFunction) {
                WarningData.cancelFunction();
                handleClose();
              } else handleClose();
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={loading}
            className={cn(
              "w-full bg-[#FDB528] text-white h-[39px] text-[13px]/[15px] font-medium rounded-[8px]",
              WarningData.color === "red" && "bg-[#FF3B30]"
            )}
            onClick={async () => {
              setLoading(true);
              await WarningData.function();
              setLoading(false);
              handleClose();
            }}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              WarningData.backButtonText
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WarningModal;
