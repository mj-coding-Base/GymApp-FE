import { create } from "zustand";
interface ViewGroupDetailsState {
  openViewGroupDetails: boolean;
  openGroupMemberProfile: boolean;
  openUpdateGroupMember: boolean;
  openAddNewGroup: boolean;
  openTransferMemberToAGroup: boolean;
  openTransferMemberToExistingGroup: boolean;
  setOpenViewGroupDetails: (value: boolean) => void;
  setOpenGroupMemberProfile: (value: boolean) => void;
  setOpenUpdateGroupMember: (value: boolean) => void;
  setOpenAddNewGroup: (value: boolean) => void;
  setOpenTransferMemberToAGroup: (value: boolean) => void;
  setOpenTransferMemberToExistingGroup: (value: boolean) => void;
  selectedGroupData: string | null;
  setSelectedGroupData: (_id:string) => void;
}

export const useViewGroupDetails = create<ViewGroupDetailsState>((set) => ({
  openViewGroupDetails: false,
  openGroupMemberProfile: false,
  openAddNewGroup: false,
  openUpdateGroupMember: false,
  openTransferMemberToAGroup: false,
  openTransferMemberToExistingGroup: false,
  setOpenViewGroupDetails: (openViewGroupDetails) =>
    set({ openViewGroupDetails }),
  setOpenGroupMemberProfile: (openGroupMemberProfile) =>
    set({ openGroupMemberProfile }),
  setOpenUpdateGroupMember: (openUpdateGroupMember) =>
    set({ openUpdateGroupMember }),
  setOpenAddNewGroup: (openAddNewGroup) => set({ openAddNewGroup }),
  setOpenTransferMemberToAGroup: (openTransferMemberToAGroup) =>
    set({ openTransferMemberToAGroup }),
  setOpenTransferMemberToExistingGroup: (openTransferMemberToExistingGroup) =>
    set({ openTransferMemberToExistingGroup }),
  selectedGroupData: null,
  setSelectedGroupData: (_id: string) => set({ selectedGroupData: _id }),
}));
