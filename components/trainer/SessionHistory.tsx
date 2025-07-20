"use client";

import { getAllSessions2 } from "@/actions/session";
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
import { PaymentStatus, getPaymentStatusColor } from "@/types/SessionHistory";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import React from "react"; // Added React import
interface Session {
  _id: string;
  createdAt: string;
  status: string;
  customerName: string;
}

interface SessionHistoryProps {
  trainerId: string;
  trainerName: string;
}

export function SessionHistory({ trainerId, trainerName }: Readonly<SessionHistoryProps>) {
  const [open, setOpen] = useState(false);
  const [paymentStatus] = useState<PaymentStatus>(PaymentStatus.NOT_PAID);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentMonth = new Date().toLocaleString('default', { month: 'short' });
  const currentDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllSessions2(1, 10, trainerName);
      if (response.status === "SUCCESS") {
        setSessions(response.data || []);
      } else {
        toast.error(response.message || "Failed to load sessions");
      }
    } catch (error) {
      console.error("Failed to load session history:", error);
      toast.error("Failed to load session history");
    } finally {
      setIsLoading(false);
    }
  }, [trainerName]);

  useEffect(() => {
    if (open) {
      fetchSessions();
    }
  }, [open, fetchSessions]);

  const paymentStatusStyle = getPaymentStatusColor(paymentStatus);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
console.log(trainerId);
  const renderSessionItem = (session: Session, index: number) => {
    return (
      <div
        key={session._id}
        className={`grid grid-cols-3 py-3 px-4 ${
          index < sessions.length - 1 ? "border-b border-gray-200" : ""
        }`}
      >
        <div className="text-[#434745] text-[11.5px]">
          {formatDate(session.createdAt)}
        </div>
        <div className="text-[#434745] text-[11.5px] capitalize">
          {session.status.toLowerCase()}
        </div>
        <div className="text-[#434745] text-[11.5px]">
          {session.customerName}
        </div>
      </div>
    );
  };

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <div className="absolute right-0 top-35">
            <button className="w-[35px] h-[50px] bg-gray-100 rounded-tl-[30px] rounded-bl-[30px] flex items-center justify-center">
              <i className="history-icon size-[20.5px]" />
            </button>
          </div>
        </DrawerTrigger>
        <DrawerContent className="px-4 pt-1 pb-6 max-h-[90vh]">
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

              <div className="w-full">
                <div className="rounded-lg border border-[#000000] mb-6 overflow-hidden w-full">
                  <div className="grid grid-cols-12">
                    <div className="col-span-5 flex flex-col text-center justify-center border-r border-[#000000]">
                      <div className="bg-[#F6F6F6] py-0 flex items-center justify-center">
                        <button className="p-1">
                          <i className="left-arrow-icon h-4 w-4" />
                        </button>
                        <span className="text-[#6D6D6D] px-2 text-[14px]">
                          {currentMonth}
                        </span>
                        <button className="p-1">
                          <i className="right-arrow-icon h-4 w-4" />
                        </button>
                      </div>
                      <div className="py-1">
                        <span className="text-[9px] text-[#6D6D6D]">
                          Start Date:{" "}
                        </span>
                        <span className="text-[12px] text-[#3D3D3D]">
                          01/02/25
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col col-span-3 pl-2 border-r border-[#000000]">
                      <div className="py-2">
                        <span className="text-[11px] text-[#6D6D6D] block">
                          Today
                        </span>
                        <span className="text-[12px] text-[#3D3D3D]">
                          {currentDate}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-4 flex flex-col pl-2">
                      <div className="py-2">
                        <span className="text-[11px] text-[#6D6D6D] block">
                          Current Session
                        </span>
                        <span className="text-[12px] text-[#3D3D3D]">14</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-11 border-t border-r border-[#000000]">
                    <div className="p-3 flex flex-col col-span-4 border-r border-[#000000]">
                      <span className="text-[11px] text-[#6D6D6D] block">
                        Name
                      </span>
                      <span className="text-[12px] text-[#3D3D3D]">
                        {trainerName}
                      </span>
                    </div>

                    <div className="p-2 flex flex-col col-span-4 border-r border-[#000000]">
                      <span className="text-[11px] text-[#6D6D6D] block">
                        Completed Sessions
                      </span>
                      <p className="text-[12px] text-[#3D3D3D]">14</p>
                    </div>

                    <div className="p-2 flex flex-col col-span-3">
                      <span className="text-[11px] text-[#6D6D6D] block py-[1px]">
                        Payment
                      </span>
                      <div className="mt-0">
                        <span
                          className="px-2 py-1 rounded-full text-[11px]"
                          style={{
                            backgroundColor: paymentStatusStyle.bg,
                            color: paymentStatusStyle.text,
                          }}
                        >
                          {paymentStatus === PaymentStatus.NOT_PAID
                            ? "Not Paid"
                            : paymentStatus === PaymentStatus.PAID
                            ? "Paid"
                            : "Partial"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

        <div className="bg-[#F7F7F8] rounded-lg overflow-hidden w-full">
          <div className="grid grid-cols-3 bg-[#fac1be] py-3 px-4">
            <div className="text-[#454545] text-[11px]">Date</div>
            <div className="text-[#454545] text-[11px]">Status</div>
            <div className="text-[#454545] text-[11px]">Client Name</div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : sessions.length > 0 ? (
            <React.Fragment>
              {sessions.map((session, index) => renderSessionItem(session, index))}
            </React.Fragment>
          ) : (
            <div className="text-center py-4 text-[11px] text-[#4F4F4F]">
              No sessions found
            </div>
          )}
        </div>
              </div>
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </>
  );
}