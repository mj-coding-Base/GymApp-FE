"use client";

import { getTrainerSessions } from "@/actions/trainers";
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
import {
    ClientType,
    PaymentStatus,
    Session,
    getClientTypeColor,
    getPaymentStatusColor,
} from "@/types/SessionHistory";
import { Type } from "@/types/TrainerDetails";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SessionHistoryProps {
  trainerType: string;
  trainerId: string;
}

export function SessionHistory({ trainerType, trainerId }: Readonly<SessionHistoryProps>) {
  const [open, setOpen] = useState(false);
  const [paymentStatus] = useState<PaymentStatus>(PaymentStatus.NOT_PAID);
  const [sessions, setSessions] = useState<Partial<Session>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentMonth = "Feb";

  useEffect(() => {
    if (open) {
      fetchSessions();
    }
  }, [open]);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const data = await getTrainerSessions(trainerId, trainerType);
      setSessions(data as Partial<Session>[]);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to load session history:", error.message);
      } else {
        console.error("Failed to load session history:", error);
      }
      toast.error("Failed to load session history");
    } finally {
      setIsLoading(false);
    }
  };

  const paymentStatusStyle = getPaymentStatusColor(paymentStatus);

  const renderSessionItem = (item: Session, index: number) => {
    const clientTypeStyle = getClientTypeColor(item.clientType ?? ("DEFAULT_CLIENT_TYPE" as ClientType));
    return (
      <div
        key={item.id}
        className={`grid grid-cols-3 py-3 px-4 ${
          index < sessions.length - 1 ? "border-b border-gray-200" : ""
        }`}
      >
        <div className="text-[#434745] text-[11.5px]">{item.date}</div>
        <div className="text-[#434745] text-[11.5px]">{item.session}</div>
        <div>
          <span
            className="px-4 py-1 rounded-full text-[11px]"
            style={{
              backgroundColor: clientTypeStyle.bg,
              color: clientTypeStyle.text,
            }}
          >
            {item.clientType}
          </span>
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

              {trainerType === Type.PART_TIME ? (
                <div className="w-full">
                  <div className="rounded-lg border border-[#000000] mb-6 overflow-hidden w-full">
                    {/* Header section */}
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
                            03/03/25
                          </span>
                        </div>
                      </div>
                      <div className="col-span-4 flex flex-col pl-2">
                        <div className="py-2">
                          <span className="text-[11px] text-[#6D6D6D] block">
                            Current Session
                          </span>
                          <span className="text-[12px] text-[#3D3D3D]">11</span>
                        </div>
                      </div>
                    </div>

                    {/* Trainer info section */}
                    <div className="grid grid-cols-11 border-t border-r border-[#000000]">
                      <div className="p-3 flex flex-col col-span-4 border-r border-[#000000]">
                        <span className="text-[11px] text-[#6D6D6D] block">
                          Name
                        </span>
                        <span className="text-[12px] text-[#3D3D3D]">
                          Maria Fernando
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

                  {/* Sessions list */}
                  <div className="bg-[#F7F7F8] rounded-lg overflow-hidden w-full">
                    <div className="grid grid-cols-3 bg-[#fac1be] py-3 px-4">
                      <div className="text-[#454545] text-[11px]">Date</div>
                      <div className="text-[#454545] text-[11px]">Session</div>
                      <div className="text-[#454545] text-[11px]">
                        Client Type
                      </div>
                    </div>

                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      sessions
                        .map((item, index) =>
                          renderSessionItem(
                            {
                              id: item.id ?? "",
                              date: item.date ?? "",
                              session: item.session ?? "",
                              clientType: item.clientType ?? ("DEFAULT_CLIENT_TYPE" as ClientType),
                              // add other required Session fields with defaults if needed
                            } as Session,
                            index
                          )
                        )
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  {/* Full-time trainer header */}
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
                          <span className="text-[12px] text-[#6D6D6D] block">
                            Today
                          </span>
                          <span className="text-[12px] text-[#3D3D3D]">
                            03/03/25
                          </span>
                        </div>
                      </div>

                      <div className="col-span-4 flex flex-col pl-2">
                        <div className="py-2">
                          <span className="text-[12px] text-[#6D6D6D] block">
                            Current Session
                          </span>
                          <span className="text-[12px] text-[#3D3D3D]">11</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 border-t border-r border-[#000000]">
                      <div className="p-3 flex flex-col col-span-1 border-r border-[#000000]">
                        <span className="text-[12px] text-[#6D6D6D] block">
                          Name
                        </span>
                        <span className="text-[12px] text-[#3D3D3D]">
                          Maria Fernando
                        </span>
                      </div>

                      <div className="p-3 flex flex-col col-span-1">
                        <span className="text-[12px] text-[#6D6D6D] block">
                          Planned sessions
                        </span>
                        <p className="text-[12px] text-gray-700 font-medium">
                          14
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sessions list */}
                  <div className="bg-[#F7F7F8] rounded-lg overflow-hidden w-full">
                    <div className="grid grid-cols-3 bg-[#fac1be] py-3 px-4">
                      <div className="text-[#454545] text-[11px]">Date</div>
                      <div className="text-[#454545] text-[11px]">Session</div>
                      <div className="text-[#454545] text-[11px]">
                        Client Type
                      </div>
                    </div>

                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      sessions.map((item, index) =>
                        renderSessionItem(
                          {
                            id: item.id ?? "",
                            date: item.date ?? "",
                            session: item.session ?? "",
                            clientType: item.clientType ?? ("DEFAULT_CLIENT_TYPE" as ClientType),
                            // add other required Session fields with defaults if needed
                          } as Session,
                          index
                        )
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </>
  );
}
