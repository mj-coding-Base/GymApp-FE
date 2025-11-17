import { NewUserGroupRegisterData, UpdateGroupMemberData } from "@/types/Group";
import { getGymIdFromToken } from "@/utils/jwt";
import { create } from "zustand";

interface GroupDetailsStoreState {
  updateGroupMemberData: UpdateGroupMemberData | null;
  newUserGroupRegisterData: NewUserGroupRegisterData | null;
  currentGymId: string | null; // 🔒 Track current gymId to prevent cross-tenant data leakage
  setUpdateGroupMemberData: (value: UpdateGroupMemberData | null) => void;
  setNewUserGroupRegisterData: (value: NewUserGroupRegisterData | null) => void;
  selectedGroupData: string | null;
  setSelectedGroupData: (_id:string) => void;
  clearStore: () => void; // 🔒 Clear all data (called on logout/gym switch)
}

/**
 * 🔒 SECURITY: Validate gymId before accessing store data
 * Prevents cross-tenant data leakage by ensuring data belongs to current gym
 */
function validateGymId(): string | null {
  if (typeof window === 'undefined') return null;
  return getGymIdFromToken(localStorage.getItem('x-auth-token'));
}

export const useGroupDetailsStore = create<GroupDetailsStoreState>((set, get) => ({
  updateGroupMemberData: null,
  newUserGroupRegisterData: null,
  currentGymId: null,
  setUpdateGroupMemberData: (updateGroupMemberData) => {
    const currentGymId = validateGymId();
    // 🔒 SECURITY: Clear store if gymId changed
    if (get().currentGymId && get().currentGymId !== currentGymId) {
      console.warn('[SECURITY] GymId changed, clearing GroupDetailsStore');
      set({
        updateGroupMemberData: null,
        newUserGroupRegisterData: null,
        selectedGroupData: null,
        currentGymId: currentGymId,
      });
      return;
    }
    set({ updateGroupMemberData, currentGymId });
  },
  setNewUserGroupRegisterData: (newUserGroupRegisterData) => {
    const currentGymId = validateGymId();
    // 🔒 SECURITY: Clear store if gymId changed
    if (get().currentGymId && get().currentGymId !== currentGymId) {
      console.warn('[SECURITY] GymId changed, clearing GroupDetailsStore');
      set({
        updateGroupMemberData: null,
        newUserGroupRegisterData: null,
        selectedGroupData: null,
        currentGymId: currentGymId,
      });
      return;
    }
    set({ newUserGroupRegisterData, currentGymId });
  },
  selectedGroupData: null,
  setSelectedGroupData: (_id: string) => {
    const currentGymId = validateGymId();
    // 🔒 SECURITY: Clear store if gymId changed
    if (get().currentGymId && get().currentGymId !== currentGymId) {
      console.warn('[SECURITY] GymId changed, clearing GroupDetailsStore');
      set({
        updateGroupMemberData: null,
        newUserGroupRegisterData: null,
        selectedGroupData: null,
        currentGymId: currentGymId,
      });
      return;
    }
    set({ selectedGroupData: _id, currentGymId });
  },
  clearStore: () => {
    set({
      updateGroupMemberData: null,
      newUserGroupRegisterData: null,
      selectedGroupData: null,
      currentGymId: null,
    });
  },
}));
