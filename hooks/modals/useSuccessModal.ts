import { create } from "zustand";

interface SuccessModalState {
  successData: {
    title: string;
    description?: string;
    backButtonText: string;
    function: () => void;
  };
  openSuccessModal: boolean;
  setOpenSuccessModal: (value: boolean) => void;
  setSuccessData: (data: SuccessModalState["successData"]) => void;
}

export const useSuccessModal = create<SuccessModalState>((set) => ({
  successData: {
    title: "",
    backButtonText: "",
    function: () => {},
  },
  openSuccessModal: false,
  setOpenSuccessModal: (openSuccessModal) => set({ openSuccessModal }),
  setSuccessData: (successData) => set({ successData }),
}));
