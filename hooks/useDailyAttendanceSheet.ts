import { create } from "zustand";

interface DailyAttendanceSheetState {
  openDailyAttendanceSheet: boolean;
  setOpenDailyAttendanceSheet: (value: boolean) => void;
}

export const useDailyAttendanceSheet = create<DailyAttendanceSheetState>((set) => ({
  openDailyAttendanceSheet: false,
  setOpenDailyAttendanceSheet: (openDailyAttendanceSheet) =>
    set({ openDailyAttendanceSheet }),
}));
