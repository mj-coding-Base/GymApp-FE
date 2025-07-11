"use client";

// import { getAllSessions } from "@/actions/session";
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
import { useEffect, useState } from "react";

interface SessionData {
  date: string;
  startTime: string;
  session: string;
  trainer: string;
  paymentStatus?: PaymentStatus;
}

interface PaymentHistoryProps {
  readonly clientId?: string; // Add clientId prop if needed
}

export function IndividualSessionHistory({ clientId }: PaymentHistoryProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionData] = useState<SessionData[]>([]);
  const [paymentStatus] = useState<PaymentStatus>(PaymentStatus.NOT_PAID);
  // const [currentMonth, setCurrentMonth] = useState("");
console.log(clientId);
  useEffect(() => {
    if (open) {
      fetchSessionData();
    }
  }, [open]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call your API action
  //   const response = await getAllSessions({
  //   customer_type: 'individual'
  // });

      // if (response.status === "SUCCESS") {
      //   setSessionData(response.data.push.);
      //   setPaymentStatus(response.data.paymentStatus || PaymentStatus.NOT_PAID);
      //   // setCurrentMonth(new Date().toLocaleString('default', { month: 'short' }));
      // } else {
      //   throw new Error(response.message || "Failed to fetch sessions");
      // }
    } catch (err) {
      console.error("Session fetch error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

   getPaymentStatusColor(paymentStatus);

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
                {loading && <span className="text-xs ml-2">Loading...</span>}
              </DrawerTitle>
            </DrawerHeader>

            {error ? (
              <div className="text-red-500 text-center p-4">{error}</div>
            ) : (
              <div className="w-full">
                {/* Calendar/Date Section - Remains the same */}
                <div className="rounded-lg border border-[#000000] mb-6 overflow-hidden w-full">
                  {/* ... existing calendar UI ... */}
                </div>

                {/* Sessions List */}
                <div className="rounded-lg border border-[#E7E7E7] mb-6 overflow-hidden w-full">
                  <div className="grid grid-cols-4 bg-[#fac1be] py-3 px-4">
                    <div className="text-[#434745] text-[11.5px]">Date</div>
                    <div className="text-[#434745] text-[11.5px]">Start Time</div>
                    <div className="text-[#434745] text-[11.5px]">Session</div>
                    <div className="text-[#434745] text-[11.5px]">Trainer</div>
                  </div>

                  {sessionData.length > 0 ? (
                    sessionData.map((item, index) => (
                      <div
                        key={`${item.date}-${item.startTime}-${item.session}-${item.trainer}`}
                        className={`grid grid-cols-4 py-3 px-4 ${
                          index < sessionData.length - 1 ? "border-b border-gray-200" : ""
                        }`}
                      >
                        <div className="text-[#434745] text-[11.5px]">{item.date}</div>
                        <div className="text-[#434745] text-[11.5px]">{item.startTime}</div>
                        <div className="text-[#434745] text-[11.5px]">{item.session}</div>
                        <div className="text-[#434745] text-[11.5px]">{item.trainer}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      {loading ? "Loading sessions..." : "No sessions found"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
