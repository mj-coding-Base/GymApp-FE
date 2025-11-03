/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonResponseDataType } from "./Common";

export interface Customer {
  _id: string;
  name: string;
  nic: string;
  email: string;
  mobileNumber: string;
  packageId: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isPaid: boolean;
  package_name: string;
  groupMembersNames: any[];
  currentSession?: number;
  // type?: "individual" | "group";
  groupMembers?: { _id: string; name: string }[];
}

export interface FetchedCustomer {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  nic?: string;
  mobileNumber?: string;
  packageId?: string;
  fee?: number;
  isActive?: boolean;
  isPaid?: boolean;
  // type?: "individual" | "group";
}

export interface FetchedGroupCustomer {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  nic?: string;
  mobileNumber?: string;
  packageId?: string;
  fee?: number;
  isActive?: boolean;
  isPaid?: boolean;
  relationToPrimaryMember?: string;
  isPrimaryMember?: boolean;

  group_id?: string;
  number_of_members?: number;
  package_name?: string;
  clientId: string;
  groupId?: string;
  availableSessionQuota?: number;

  groupMembersNames?: string[];
}

// For the deactivateCustomer response
export type DeactivateCustomerResponse =
  | string
  | { status: "SUCCESS" | "FAIL"; message?: string; data?: any }
  | CommonResponseDataType;

export type IndividualCustomer = {
  _id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  firstName: string;
  lastName: string;
  addressLine1 :  string ,
  addressLine2 :  string ,
  email: string;
  nic: string;
  mobileNumber: string;
  packageId: string;
  fee: number;
  isActive: boolean;
  isPaid: boolean;
  package_name: string;
  availableSessionQuota: number;
  clientId: string; 
  groupId?: string;
  whyJoin: string;
  profession: string;
  dob: string;
  isMale : true,
  isMarried : true,
  deactivateAt?: string;
  reference?: string;
  profilePicture?: string;
};

export type NewIndividualCustomer ={
  _id: string;
  firstName :  string ,
  lastName :  string ,
  nic :  string ,
  addressLine1 :  string ,
  addressLine2 :  string ,
  email :  string ,
  mobileNumber :  string ,
  packageId :  string ,
  isMale : true,
  dob :  string ,
  isMarried : true,
  whyJoin :  string ,
  profession :  string,
  clientId :  string,
  deactivateAt?: string,
  reference?: string
}

// API response member structure
export type GroupMember = {
  id: string;
  clientId: string;
  name: string;
  relationship: string; // "primary" | "member"
  packageId: string;
};

// API response group structure
export type GroupApiResponse = {
  groupId: string;
  createdAt: string;
  status: string;
  members: GroupMember[];
};

export type GroupShort ={
  _id: string; // groupId from API
  createdAt: string;
  updatedAt?: string; // Not in API, optional
  primaryMember: string; // Derived from members array
  number_of_members: number; // Derived from members.length
  package_name: string; // May need to be derived or fetched
  status: string;
  groupId: string; // Added for compatibility

}
export type GroupFull ={
  _id: string; // groupId from API
  createdAt: string;
  updatedAt?: string; // Not in API, optional
  primaryMember: string; // Derived from members array
  number_of_members: number; // Derived from members.length
  package_name: string; // May need to be derived or fetched
  status: string;
  members: GroupCustomer[];
  groupId: string; // Added for compatibility

}
export type GroupCustomer = {
  _id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  nic: string;
  mobileNumber: string;
  relationToPrimaryMember: string;
  isPrimaryMember: boolean;
  packageId: string;
  fee: number;
  isActive: boolean;
  isPaid: boolean;
  group_id: string;
  number_of_members: number;
  package_name: string;
  availableSessionQuota: number;
  clientId: string;
  groupId?: string;
  deactivateAt?: string;
  reference?: string;
};

export type CustomerView = {
  customer: {
    _id: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string;
    nic: string;
    packageId: string;
    fee: number;
    isActive: boolean;
    isPaid: boolean;
  };
  paymentHistory: PaymentHistory[];
  packageHistory: PackageHistory[];
};

export type PaymentHistory = {
  _id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  month: string;
  amount: number;
  paidFor: string;
  isExtra: string;
  paymentId:string;
};

export type AttendanceHistory = {
  _id: string;
  attendedDateTime: string;
};

type PackageHistory = {
  _id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  customerOrGroupId: string;
  amount: number;
  paymentFor: string;
  type: string;
  packageId: string;
  totalPayments: number;
  package: {
    _id: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    sessions_allocated: number;
    package_name: string;
  };
};