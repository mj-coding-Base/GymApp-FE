import { fetchGroupPaymentDetails } from "@/actions/clientPayment";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useCollectPaymentSuccessGroupSheet } from "@/hooks/useCollectPaymentSuccessGroupSheet";
import { useEffect, useState } from "react";
import MonthSelector from "../MonthSelector";

interface GroupMember {
  id: string;
  name: string;
  nic: string;
  currentSession: number;
  paymentStatus: 'PAID' | 'PENDING' | 'OVERDUE';
  lastPaymentDate?: string;
}

const CollectPaymentSuccessGroup = () => {
  const {
    openCollectPaymentSuccessGroupSheet,
    setOpenCollectPaymentSuccessGroupSheet,
  } = useCollectPaymentSuccessGroupSheet();

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  console.log(loading);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (openCollectPaymentSuccessGroupSheet) {
      fetchData();
    }
  }, [openCollectPaymentSuccessGroupSheet, selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call with dummy data
      const response = await fetchGroupPaymentDetails({
        month: selectedMonth,
        year: selectedYear
      });

      if (response.status === "SUCCESS") {
        setMembers(response.data.members || []);
      } else {
        throw new Error(response.message || "Failed to fetch group payment details");
      }
    } catch (err) {
      console.error("Error fetching group payments:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      // Fallback dummy data
      setMembers([
        {
          id: "1",
          name: "Raj Ayesh",
          nic: "1234567890",
          currentSession: 11,
          paymentStatus: "PAID",
          lastPaymentDate: "03/03/25"
        },
        {
          id: "2",
          name: "Priya Sharma",
          nic: "9876543210",
          currentSession: 8,
          paymentStatus: "PENDING",
          lastPaymentDate: "02/28/25"
        },
        {
          id: "3",
          name: "Amit Patel",
          nic: "4567891230",
          currentSession: 12,
          paymentStatus: "OVERDUE",
          lastPaymentDate: "01/15/25"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  return (
    <Sheet
      open={openCollectPaymentSuccessGroupSheet}
      onOpenChange={setOpenCollectPaymentSuccessGroupSheet}
    >
      <SheetContent
        side="bottom"
        className="rounded-t-2xl min-h-[600px] max-h-[calc(100%-40px)]"
      >
        <SheetHeader className="gap-5">
          <SheetTitle className="text-[14px] font-semibold text-[#363636] text-center">
            Collect Payment from Group
          </SheetTitle>
          <SheetDescription className="relative w-full max-w-sm">
            <i className="search-icon w-[16.54px] h-[18.9px] text-[#000000] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search by Full name/ NIC"
              className="pl-10 text-[11px] font-normal text-[#4F4F4F]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SheetDescription>
        </SheetHeader>
        
        <div className="px-4 overflow-y-auto">
          {error && (
            <div className="bg-red-100 text-red-800 p-2 mb-4 rounded text-sm">
              {error} (Showing demo data)
            </div>
          )}

          <div className="mt-[10px] border-[1px] border-[#000000] rounded-[12px] overflow-hidden">
            <div className="flex border-b-[1px] border-b-[#000000]">
              <div className="flex-[60%] shrink-0 px-[10px] py-[7.8px] border-x-[1px] border-x-[#000000] content-center">
                <MonthSelector 
                  onMonthChange={handleMonthChange}
                  initialMonth={selectedMonth}
                  initialYear={selectedYear}
                />
              </div>
              <div className="flex-[40%] shrink-0 px-[10px] py-[7.8px] content-center flex flex-col gap-[5px]">
                <p className="text-[#6D6D6D] text-[12px] font-medium">Today</p>
                <p className="text-[#3D3D3D] text-[12px] font-semibold">
                  {new Date().toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex bg-[#D7FFDB]">
              <div className="flex-[45%] shrink-0 px-[10px] py-[7.8px] content-center flex flex-col gap-[5px]">
                <p className="text-[#6D6D6D] text-[12px] font-medium">Group</p>
                <p className="text-[#3D3D3D] text-[12px] font-semibold">
                  {members[0]?.name || "N/A"}
                </p>
              </div>

              <div className="flex-[55%] px-[10px] py-[7.8px] flex flex-col gap-[5px]">
                <p className="text-[#6D6D6D] text-[12px] font-medium">
                  Last Payment Date
                </p>
                <p className="text-[#3D3D3D] text-[12px] font-semibold">
                  {members[0]?.lastPaymentDate || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 border-[#E7E7E7] border-[1px] rounded-[15px] overflow-hidden">
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CollectPaymentSuccessGroup;