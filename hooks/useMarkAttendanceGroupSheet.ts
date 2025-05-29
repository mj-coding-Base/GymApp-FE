import { create } from "zustand";

interface MarkAttendanceGroupSheetState {
  openMarkAttendanceGroupSheet: boolean;
  setOpenMarkAttendanceGroupSheet: (value: boolean) => void;
}

export const useMarkAttendanceGroupSheet =
  create<MarkAttendanceGroupSheetState>((set) => ({
    openMarkAttendanceGroupSheet: false,
    setOpenMarkAttendanceGroupSheet: (openMarkAttendanceGroupSheet) =>
      set({ openMarkAttendanceGroupSheet }),
  }));
