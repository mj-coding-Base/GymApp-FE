import { NewUserGroupRegisterData, UpdateGroupMemberData } from "@/types/Group";
import { create } from "zustand";

interface GroupDetailsStoreState {
  updateGroupMemberData: UpdateGroupMemberData | null;
  newUserGroupRegisterData: NewUserGroupRegisterData | null;
  setUpdateGroupMemberData: (value: UpdateGroupMemberData | null) => void;
  setNewUserGroupRegisterData: (value: NewUserGroupRegisterData | null) => void;
  selectedGroupData: string | null;
  setSelectedGroupData: (_id:string) => void;
}

export const useGroupDetailsStore = create<GroupDetailsStoreState>((set) => ({
  updateGroupMemberData: null,
  newUserGroupRegisterData: null,
  setUpdateGroupMemberData: (updateGroupMemberData) =>
    set({ updateGroupMemberData }),
  setNewUserGroupRegisterData: (newUserGroupRegisterData) =>
    set({ newUserGroupRegisterData }),
  selectedGroupData: null,
  setSelectedGroupData: (_id: string) => set({ selectedGroupData: _id }),
}));
