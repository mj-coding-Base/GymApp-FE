import { create } from "zustand";

interface ProfileDetailsSheetState {
  openProfileDetailsSheet: boolean;
  setOpenProfileDetailsSheet: (value: boolean) => void;
}

export const useProfileDetailsSheet = create<ProfileDetailsSheetState>(
  (set) => ({
    openProfileDetailsSheet: false,
    setOpenProfileDetailsSheet: (openProfileDetailsSheet) =>
      set({ openProfileDetailsSheet }),
  })
);
