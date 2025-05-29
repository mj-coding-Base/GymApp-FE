export interface GroupData {
  dateRegistered: string;
  status: string;
  numOfMembers: number;
  groupMember: string;
  nic: string;
  package: string;
}

export interface GroupMemberData {
  dateRegistered: string;
  status: string;
  nic: string;
  member: string;
  mobileNumber: string;
  relationship: string;
  paymentStatus: string;
}

export interface UpdateGroupMemberData {
  firstName: string;
  lastName: string;
  mobileNumber: number;
  email: string;
  nic: string;
  feePerMember: number;
}

export interface NewUserGroupRegisterData {
  firstName: string;
  lastName: string;
  mobileNumber: number;
  email: string;
  nic: string;
}
