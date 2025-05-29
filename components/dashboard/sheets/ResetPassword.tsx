import React from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useResetPasswordSheet } from "@/hooks/useResetPasswordSheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const ResetPassword = () => {
  const { openResetPasswordSheet, setOpenResetPasswordSheet } =
    useResetPasswordSheet();

  return (
    <Sheet
      open={openResetPasswordSheet}
      onOpenChange={setOpenResetPasswordSheet}
    >
      <SheetContent
        side="bottom"
        className="rounded-t-2xl min-h-120 max-h-[calc(100%-40px)]"
      >
        <SheetHeader>
          <SheetTitle className="text-[14px] font-semibold text-[#363636] flex items-center">
            <i className="back-icon w-4 h-4 text-black" />
            <p className="ml-[5px] text-[11.2px]/[100%] text-[#212121] font-medium">
              Back
            </p>
          </SheetTitle>
        </SheetHeader>
        <div className="px-5 flex flex-col overflow-y-auto gap-[20px]">
          <p className="text-[14px]/[100%] font-medium text-[#3D3D3D]">
            Reset Password
          </p>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="session"
              className="text-[12px]/[100%] font-medium text-[#4F4F4F]"
            >
              Current Password
            </Label>
            <Input
              placeholder="Current Password"
              type="password"
              id="session"
              className="h-[53px] text-[14px]/[100%] font-semibold text-[#4F4F4F] placeholder:text-[#B0B0B0] placeholder:font-normal"
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="session"
              className="text-[12px]/[100%] font-medium text-[#4F4F4F]"
            >
              Current Password
            </Label>
            <Input
              placeholder="Current Password"
              type="password"
              id="session"
              className="h-[53px] text-[14px]/[100%] font-semibold text-[#4F4F4F] placeholder:text-[#B0B0B0] placeholder:font-normal"
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="session"
              className="text-[12px]/[100%] font-medium text-[#4F4F4F]"
            >
              Current Password
            </Label>
            <Input
              placeholder="Current Password"
              type="password"
              id="session"
              className="h-[53px] text-[14px]/[100%] font-semibold text-[#4F4F4F] placeholder:text-[#B0B0B0] placeholder:font-normal"
            />
          </div>
        </div>
        <SheetFooter className="flex flex-row justify-center">
          <SheetClose asChild>
            <Button
              variant={"outline"}
              className="border-[#69716C] rounded-[10px] text-[13px] font-semibold text-[#69716C] h-[40px] w-[118px]"
            >
              Cancel
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button
              type="submit"
              className="bg-[#378644] rounded-[10px] text-[13px] font-semibold text-[#FFFFFF] h-[40px]  w-[118px]"
            >
              Save
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ResetPassword;
