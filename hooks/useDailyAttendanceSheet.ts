import { getGymIdFromToken } from "@/utils/jwt";
import { create } from "zustand";

interface DailyAttendanceSheetState {
  openDailyAttendanceSheet: boolean;
  currentGymId: string | null; // 🔒 Track current gymId to prevent cross-tenant data leakage
  setOpenDailyAttendanceSheet: (value: boolean) => void;
  clearStore: () => void; // 🔒 Clear all data (called on logout/gym switch)
}

/**
 * 🔒 SECURITY: Validate gymId before accessing store data
 */
function validateGymId(): string | null {
  if (typeof window === 'undefined') return null;
  return getGymIdFromToken(localStorage.getItem('x-auth-token'));
}

export const useDailyAttendanceSheet = create<DailyAttendanceSheetState>((set, get) => ({
  openDailyAttendanceSheet: false,
  currentGymId: null,
  setOpenDailyAttendanceSheet: (openDailyAttendanceSheet) => {
    const currentGymId = validateGymId();
    // 🔒 SECURITY: Clear store if gymId changed
    if (get().currentGymId && get().currentGymId !== currentGymId) {
      console.warn('[SECURITY] GymId changed, clearing DailyAttendanceSheet');
      set({ openDailyAttendanceSheet: false, currentGymId: currentGymId });
      return;
    }
    set({ openDailyAttendanceSheet, currentGymId });
  },
  clearStore: () => {
    set({ openDailyAttendanceSheet: false, currentGymId: null });
  },
}));
