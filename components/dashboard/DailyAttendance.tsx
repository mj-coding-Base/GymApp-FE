"use client";

import { DailyAttendanceData, fetchDailyAttendance } from "@/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDailyAttendanceSheet } from "@/hooks/useDailyAttendanceSheet";
import { format } from "date-fns";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import WhiteCard from "./WhiteCard";

const DailyAttendance = () => {
  const { openDailyAttendanceSheet, setOpenDailyAttendanceSheet } = useDailyAttendanceSheet();
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  
  const [attendanceData, setAttendanceData] = useState<DailyAttendanceData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(true);

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const handleSearch = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select both start and end dates");
      return;
    }

    setIsLoading(true);
    try {
      const startDate = format(dateRange.from, "yyyy-MM-dd");
      const endDate = format(dateRange.to, "yyyy-MM-dd");
      
      const data = await fetchDailyAttendance(startDate, endDate);
      setAttendanceData(data);
      setShowCalendar(false);
      toast.success("Attendance data loaded successfully");
    } catch (error) {
      toast.error("Failed to fetch attendance data");
      console.error("Error fetching attendance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToCalendar = () => {
    setShowCalendar(true);
    setAttendanceData(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "EEEE, MMMM dd, yyyy");
  };

  return (
    <Sheet open={openDailyAttendanceSheet} onOpenChange={setOpenDailyAttendanceSheet}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl min-h-120 max-h-[calc(100%-40px)]"
      >
        <SheetHeader className="gap-5">
          <SheetTitle className="text-[14px] font-semibold text-[#363636]">
            Daily Attendance
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col px-4 overflow-y-auto gap-[20px]">
          {showCalendar ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDateSelect}
                  numberOfMonths={1}
                  className="rounded-md border"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleSearch}
                  disabled={!dateRange?.from || !dateRange?.to || isLoading}
                  className="flex-1 bg-[#363636] rounded-[10px] text-[13px] font-semibold text-[#FFFFFF] h-[40px]"
                >
                  {isLoading ? "Searching..." : "Search"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setOpenDailyAttendanceSheet(false)}
                  className="flex-1 border-[#69716C] rounded-[10px] text-[13px] font-semibold text-[#69716C] h-[40px]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handleBackToCalendar}
                  className="border-[#69716C] rounded-[10px] text-[12px] font-medium text-[#69716C] h-[35px] px-3"
                >
                  ← Back to Calendar
                </Button>
                <div className="text-[12px] text-[#4F4F4F]">
                  {dateRange?.from && dateRange?.to && (
                    <span>
                      {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
                    </span>
                  )}
                </div>
              </div>

              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {attendanceData && attendanceData.length > 0 ? (
                  attendanceData.map((dayData) => (
                    <WhiteCard key={dayData.date} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                          <i className="calendar-icon size-[16px] text-[#3D3D3D]" />
                          <h3 className="text-[14px] font-semibold text-[#3D3D3D]">
                            {formatDate(dayData.date)}
                          </h3>
                        </div>
                        
                        <div className="space-y-2">
                          {dayData.attendances.map((attendance, index) => (
                            <div
                              key={`${attendance.customerId}-${index}`}
                              className="flex items-center justify-between bg-[#F8F9FA] rounded-[10px] p-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#fac1be] rounded-full flex items-center justify-center">
                                  <span className="text-[12px] font-semibold text-[#F04237]">
                                    {attendance.firstName.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-[13px] font-medium text-[#3D3D3D]">
                                    {attendance.firstName} {attendance.lastName}
                                  </p>
                                  <p className="text-[11px] text-[#4F4F4F]">
                                    ID: {attendance.customerId}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[12px] font-semibold text-[#F04237]">
                                  {attendance.time}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </WhiteCard>
                  ))
                ) : (
                  <WhiteCard className="p-6 text-center">
                    <i className="calendar-icon size-[32px] text-[#9CA3AF] mx-auto mb-3" />
                    <p className="text-[14px] text-[#4F4F4F]">
                      No attendance records found for the selected date range.
                    </p>
                  </WhiteCard>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DailyAttendance;
