import { create } from "zustand";

interface ExtraPaymentCollectionSheetState {
  openExtraPaymentCollectionSheet: boolean;
  setOpenExtraPaymentCollectionSheet: (value: boolean) => void;
}

export const useExtraPaymentCollectionSheet =
  create<ExtraPaymentCollectionSheetState>((set) => ({
    openExtraPaymentCollectionSheet: false,
    setOpenExtraPaymentCollectionSheet: (openExtraPaymentCollectionSheet) =>
      set({ openExtraPaymentCollectionSheet }),
  }));
