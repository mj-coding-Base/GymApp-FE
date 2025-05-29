import { create } from "zustand";

interface ResetPasswordSheetState {
  openResetPasswordSheet: boolean;
  setOpenResetPasswordSheet: (value: boolean) => void;
}

export const useResetPasswordSheet = create<ResetPasswordSheetState>((set) => ({
  openResetPasswordSheet: false,
  setOpenResetPasswordSheet: (openResetPasswordSheet) =>
    set({ openResetPasswordSheet }),
}));
