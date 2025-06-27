"use server";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarForm } from "@/components/common/CalendarForm";
import TrainerInfo from "@/components/trainer/TrainerInfo";
import { TrainerRegistration } from "@/components/trainer/TrainerRegistration";

export default function ClientPaymentsPage() {
  return (
    <div className="">
      <div>
        <Card className="py-3 mt-2">
          <CardContent className="flex-col pl-0 pr-0">
            <div className="flex py-0 gap-2 mb-2 px-3">
              <div className="relative flex-1">
                <i className="search-icon absolute left-3 top-3 h-[12.8px] w-[12.8px] text-[#9E9E9E]" />
                <Input
                  className="pl-8 pr-4 rounded-[24px] text-[#9E9E9E] text-[12px] "
                  placeholder="Search by Full name/ NIC"
                />
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-[36.8px] w-[36.8px] "
                  >
                    <i className="calender-icon  h-[18px] w-[18px] " />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle className="text-left text-[14px]">
                    Pick Date Range
                  </DialogTitle>
                  <CalendarForm />
                </DialogContent>
              </Dialog>
            </div>
            <TrainerRegistration />
            <div className="flex w-full justify-between p-2 mb-1 bg-[#F6F6F6]">
              <div className=" flex items-center justify-center  text-[10.8px] text-[#757575]  ">
                <i className="edit-new-icon bg-[#44424D] h-[14.4px] w-[14.4px] rounded-full" />
                <span> : Edit</span>
              </div>
              <div className="flex items-center justify-center text-[10.8px] text-[#757575] ">
                <i className="update-icon bg-[#44424D] h-[14.4px] w-[14.4px] rounded-full" />
                <span> : Payment History</span>
              </div>
              <div className="flex items-center justify-center text-[10.8px] text-[#757575] ">
                <i className="history-icon bg-[#44424D] h-[14.4px] w-[14.4px] rounded-full" />
                <span> : Session History</span>
              </div>
            </div>

            <TrainerInfo />

            <div></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
