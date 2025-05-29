"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {SessionSummary, Session, GroupSessionHistoryProps,  } from "@/types/SessionHistory"
import { getAllSessions } from "@/actions/session";

export function GroupSessionHistory({ groupId }: Readonly<GroupSessionHistoryProps>) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [summary] = useState<SessionSummary>({
    currentMonth: "",
    startDate: "",
    today: "",
    currentSession: "",
    clientName: "",
    paymentStatus: "unpaid",
    extraSessionCount: "",
    extraAmountPaid: ""
  });

  useEffect(() => {
    if (open) {
      fetchSessions();
    }
  }, [open]);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const sessions = await getAllSessions({customer_type: 'individual'});
      setSessions(
        sessions.data
      );

    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Failed to load session history: ${error.message}`);
        console.error(error);
      } else {
        toast.error("Failed to load session history");
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className="w-full flex flex-col pl-2 pr-2 mt-2">
          <button className="absolute right-0 top-1 -translate-y-1/2 w-[35px] h-[50px] bg-gray-100 rounded-tl-[30px] rounded-bl-[30px] flex items-center justify-center">
            <i className="arrow-right size-[12px]" />
          </button>
        </div>
      </DrawerTrigger>
      <DrawerContent className="px-4 pt-0 pb-6 max-h-[90vh]">
        <ScrollArea className="flex-grow overflow-y-auto">
          <div className="mx-auto w-full max-w-md">
            <DrawerHeader className="px-0 py-3 mb-1">
              <DrawerClose asChild>
                <div className="flex items-center gap-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8 p-0">
                    <i className="back-icon size-3" />
                    <span className="sr-only">Back</span>
                  </Button>
                  <span className="text-[11.2px]">Back</span>
                </div>
              </DrawerClose>
              <DrawerTitle className="text-[16px] text-center">
                Session History
              </DrawerTitle>
            </DrawerHeader>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="w-full">
                <div className="rounded-lg border border-[#000000] mb-4 overflow-hidden w-full">
                  <div className="grid grid-cols-12">
                    <div className="col-span-5 flex flex-col text-center justify-center border-r border-[#000000]">
                      <div className="bg-[#F6F6F6] flex items-center justify-center">
                        <button className="p-1">
                          <i className="left-arrow-icon h-4 w-4" />
                        </button>
                        <span className="text-[#6D6D6D] px-2 text-[14px]">
                          {summary.currentMonth}
                        </span>
                        <button className="p-1">
                          <i className="right-arrow-icon h-4 w-4" />
                        </button>
                      </div>
                      <div className="">
                        <span className="text-[9px] text-[#6D6D6D]">
                          Start Date:{" "}
                        </span>
                        <span className="text-[12px] text-[#3D3D3D]">
                          {summary.startDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col col-span-3 pl-2 border-r border-[#000000]">
                      <div className="py-2">
                        <span className="text-[12px] text-[#6D6D6D] block">
                          Today
                        </span>
                        <span className="text-[12px] text-[#3D3D3D]">
                          {summary.today}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-4 flex flex-col pl-2">
                      <div className="py-2">
                        <span className="text-[12px] text-[#6D6D6D] block">
                          Current Session
                        </span>
                        <span className="text-[12px] text-[#3D3D3D]">
                          {summary.currentSession}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 border-t border-[#000000]">
                    <div className="p-3 flex flex-col border-r border-[#000000]">
                      <span className="text-[12px] text-[#6D6D6D] block">
                        Name
                      </span>
                      <p className="text-[12px] text-[#3D3D3D]">
                        {summary.clientName}
                      </p>
                    </div>

                    <div className="p-2 flex flex-col">
                      <span className="text-[12px] text-[#6D6D6D] block py-[1px]">
                        Payment
                      </span>
                      <div className="flex">
                        <span
                          className="flex px-4 rounded-full text-[12px] text-center justify-center items-center w-[46px] h-[25px]"
                          style={{
                            backgroundColor: summary.paymentStatus === "paid" ? "#00BC15" : "#D32F2F",
                            color: "#FFFFFF",
                          }}
                        >
                          {summary.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-9 border-t border-[#000000]">
                    <div className="p-3 flex flex-col col-span-5 border-r border-[#000000]">
                      <span className="text-[12px] text-[#6D6D6D] block">
                        Extra session count Added
                      </span>
                      <p className="text-[12px] text-[#3D3D3D]">
                        {summary.extraSessionCount}
                      </p>
                    </div>

                    <div className="p-3 flex flex-col col-span-4">
                      <span className="text-[12px] text-[#6D6D6D] block">
                        Extra Amount paid
                      </span>
                      <p className="text-[12px] text-[#3D3D3D]">
                        {summary.extraAmountPaid}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-[#E7E7E7] mb-6 overflow-hidden w-full">
                  <div className="grid grid-cols-4 bg-[#E3F5E5] py-3 px-4">
                    <div className="text-[#434745] text-[11.5px]">Date</div>
                    <div className="text-[#434745] text-[11.5px]">
                      Start Time
                    </div>
                    <div className="text-[#434745] text-[11.5px]">Session</div>
                    <div className="text-[#434745] text-[11.5px]">Trainer</div>
                  </div>

                  {sessions.map((item) => (
                    <div
                      key={item._id}
                      className={`grid grid-cols-4 py-3 px-4 ${
                        sessions.indexOf(item) < sessions.length - 1
                          ? "border-b border-gray-200"
                          : ""
                      }`}
                    >
                      <div className="text-[#434745] text-[11.5px]">
                        {item.createdAt}
                      </div>
                      <div className="text-[#434745] text-[11.5px]">
                        {item.trainer_name}
                      </div>
                      <div className="text-[#434745] text-[11.5px]">
                        {item.current_session}
                      </div>
                      <div className="text-[#434745] text-[11.5px]">
                        {item.trainer_name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}