import { create } from "zustand";

interface CollectPaymentIndividualSheetState {
  openCollectPaymentIndividualSheet: boolean;
  setOpenCollectPaymentIndividualSheet: (value: boolean) => void;
}

export const useCollectPaymentIndividualSheet =
  create<CollectPaymentIndividualSheetState>((set) => ({
    openCollectPaymentIndividualSheet: false,
    setOpenCollectPaymentIndividualSheet: (openCollectPaymentIndividualSheet) =>
      set({ openCollectPaymentIndividualSheet }),
  }));
