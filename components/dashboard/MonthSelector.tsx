"use client";

import { useState, useEffect } from "react";

interface MonthSelectorProps {
  onMonthChange: (month: number, year: number) => void;
  initialMonth?: number;
  initialYear?: number;
}

const MonthSelector = ({ 
  onMonthChange, 
  initialMonth = new Date().getMonth() + 1, 
  initialYear = new Date().getFullYear() 
}: MonthSelectorProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // Initialize with the first day of the specified month/year
    const date = new Date();
    date.setFullYear(initialYear, initialMonth - 1, 1);
    return date;
  });

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  useEffect(() => {
    // Call onMonthChange when the component mounts or date changes
    onMonthChange(currentDate.getMonth() + 1, currentDate.getFullYear());
  }, [currentDate, onMonthChange]);

  const changeMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    newDate.setDate(1); // Ensure it's always the first day of the month
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    return [
      date.getDate().toString().padStart(2, "0"),
      (date.getMonth() + 1).toString().padStart(2, "0"),
      date.getFullYear().toString().slice(-2)
    ].join("/");
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center gap-[10px]">
        <button
          onClick={() => changeMonth(-1)}
          className="hover:bg-gray-200 flex"
          aria-label="Previous month"
        >
          <i className="circle-arrow-left size-[18px] text-[#6D6D6D]" />
        </button>
        <span className="text-[14.3px]/[100%] text-[#6D6D6D] font-medium min-w-[40px] text-center">
          {months[currentDate.getMonth()]}
        </span>
        <button
          onClick={() => changeMonth(1)}
          className="hover:bg-gray-200 flex"
          aria-label="Next month"
        >
          <i className="circle-arrow-right size-[18px] text-[#6D6D6D]" />
        </button>
      </div>

      <p className="mt-[7px] text-[9px] text-[#6D6D6D]">
        Start Date:{" "}
        <span className="text-[12px] font-semibold text-[#3D3D3D]">
          {formatDate(currentDate)}
        </span>
      </p>
    </div>
  );
};

export default MonthSelector;