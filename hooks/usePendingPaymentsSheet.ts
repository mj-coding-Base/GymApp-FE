import { create } from "zustand";

type PendingPaymentsSheetStore = {
  openPendingPaymentsSheet: boolean;
  setOpenPendingPaymentsSheet: (open: boolean) => void;
};

export const usePendingPaymentsSheet = create<PendingPaymentsSheetStore>(
  (set) => ({
    openPendingPaymentsSheet: false,
    setOpenPendingPaymentsSheet: (open) =>
      set({ openPendingPaymentsSheet: open }),
  })
);

