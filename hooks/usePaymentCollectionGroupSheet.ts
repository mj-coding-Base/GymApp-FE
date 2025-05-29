import { create } from "zustand";

interface PaymentCollectionGroupSheetState {
  openPaymentCollectionGroupSheet: boolean;
  setOpenPaymentCollectionGroupSheet: (value: boolean) => void;
}

export const usePaymentCollectionGroupSheet =
  create<PaymentCollectionGroupSheetState>((set) => ({
    openPaymentCollectionGroupSheet: false,
    setOpenPaymentCollectionGroupSheet: (openPaymentCollectionGroupSheet) =>
      set({ openPaymentCollectionGroupSheet }),
  }));
