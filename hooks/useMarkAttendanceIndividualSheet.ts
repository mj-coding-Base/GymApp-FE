import { create } from "zustand";

interface MarkAttendanceIndividualSheetState {
  openMarkAttendanceIndividualSheet: boolean;
  setOpenMarkAttendanceIndividualSheet: (value: boolean) => void;
}

export const useMarkAttendanceIndividualSheet =
  create<MarkAttendanceIndividualSheetState>((set) => ({
    openMarkAttendanceIndividualSheet: false,
    setOpenMarkAttendanceIndividualSheet: (openMarkAttendanceIndividualSheet) =>
      set({ openMarkAttendanceIndividualSheet }),
  }));
