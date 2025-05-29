import { create } from "zustand";

interface PaymentCollectionIndividualSheetState {
  openPaymentCollectionIndividualSheet: boolean;
  setOpenPaymentCollectionIndividualSheet: (value: boolean) => void;
}

export const usePaymentCollectionIndividualSheet =
  create<PaymentCollectionIndividualSheetState>((set) => ({
    openPaymentCollectionIndividualSheet: false,
    setOpenPaymentCollectionIndividualSheet: (
      openPaymentCollectionIndividualSheet
    ) => set({ openPaymentCollectionIndividualSheet }),
  }));
