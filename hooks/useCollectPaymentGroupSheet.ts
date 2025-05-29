import { create } from "zustand";

interface CollectPaymentGroupSheetState {
  openCollectPaymentGroupSheet: boolean;
  setOpenCollectPaymentGroupSheet: (value: boolean) => void;
}

export const useCollectPaymentGroupSheet =
  create<CollectPaymentGroupSheetState>((set) => ({
    openCollectPaymentGroupSheet: false,
    setOpenCollectPaymentGroupSheet: (openCollectPaymentGroupSheet) =>
      set({ openCollectPaymentGroupSheet }),
  }));
