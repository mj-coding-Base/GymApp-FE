import { create } from "zustand";

interface CollectPaymentSuccessGroupSheetState {
  openCollectPaymentSuccessGroupSheet: boolean;
  setOpenCollectPaymentSuccessGroupSheet: (value: boolean) => void;
}

export const useCollectPaymentSuccessGroupSheet =
  create<CollectPaymentSuccessGroupSheetState>((set) => ({
    openCollectPaymentSuccessGroupSheet: false,
    setOpenCollectPaymentSuccessGroupSheet: (
      openCollectPaymentSuccessGroupSheet
    ) => set({ openCollectPaymentSuccessGroupSheet }),
  }));
