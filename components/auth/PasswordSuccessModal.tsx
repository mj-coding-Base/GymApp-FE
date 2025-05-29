import React from "react";

import Image from "next/image";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PasswordSuccessModal = () => {
  return (
    <Dialog open={false}>
      <DialogContent className="p-0 w-[317px] h-fit max-w-full rounded-[15px] max-sm:w-[390px]">
        <div className="flex flex-col items-center justify-center gap-5 px-5 py-[20px]">
          <Image
            src="/images/success-check.svg"
            alt="Logo"
            width={121}
            height={107}
            className={cn("w-auto h-auto]")}
          />
          <p className="text-xs font-normal text-black text-center w-[250px]">
            Your Password has been changed successfully.
          </p>
          <Button className="bg-[#003A02] w-full h-[42px] text-sm font-semibold rounded-[15px]">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordSuccessModal;
