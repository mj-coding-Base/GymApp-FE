import { NewUserGroupRegisterData, UpdateGroupMemberData, GroupMemberData } from "@/types/Group";
import { create } from "zustand";

interface GroupDetailsStoreState {
  updateGroupMemberData: UpdateGroupMemberData | null;
  newUserGroupRegisterData: NewUserGroupRegisterData | null;
  selectedGroupData: GroupMemberData | null; // Add this line
  setUpdateGroupMemberData: (value: UpdateGroupMemberData | null) => void;
  setNewUserGroupRegisterData: (value: NewUserGroupRegisterData | null) => void;
  setSelectedGroupData: (value: GroupMemberData | null) => void; // Add this line
}

export const useGroupDetailsStore = create<GroupDetailsStoreState>((set) => ({
  updateGroupMemberData: null,
  newUserGroupRegisterData: null,
  selectedGroupData: null, // Initialize here
  setUpdateGroupMemberData: (updateGroupMemberData) =>
    set({ updateGroupMemberData }),
  setNewUserGroupRegisterData: (newUserGroupRegisterData) =>
    set({ newUserGroupRegisterData }),
  setSelectedGroupData: (selectedGroupData) =>
    set({ selectedGroupData }), // Add this setter
}));