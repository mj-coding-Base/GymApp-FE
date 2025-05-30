/* eslint-disable @typescript-eslint/no-explicit-any */
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
  type?: "individual" | "group";
  groupMembers?: { _id: string; name: string }[];
}

export interface FetchedCustomer {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  nic?: string;
  phone?: string;
  package_id?: string;
  fee?: number;
  isActive?: boolean;
  isPaid?: boolean;
  type?: "individual" | "group";
}

export interface FetchedGroupCustomer {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  nic?: string;
  phone?: string;
  package_id?: string;
  fee?: number;
  isActive?: boolean;
  isPaid?: boolean;
  relationToPrimaryMember?: string;
  isPrimaryMember?: boolean;

  group_id?: string;
  number_of_members?: number;
  package_name?: string;
  attendedSessionCount?: number;
  type?: "individual" | "group";

  groupMembersNames?: string[];
}

export interface CommonResponseDataType<T = null> {
  status: "SUCCESS" | "FAIL";
  message: string;
  data: T;
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
  first_name: string;
  last_name: string;
  email: string;
  nic: string;
  phone: string;
  package_id: string;
  fee: number;
  isActive: boolean;
  isPaid: boolean;
  package_name: string;
  attendedSessionCount: number;
};

export type GroupCustomer = {
  _id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  nic: string;
  phone: string;
  relationToPrimaryMember: string;
  isPrimaryMember: boolean;
  package_id: string;
  fee: number;
  isActive: boolean;
  isPaid: boolean;
  group_id: string;
  number_of_members: number;
  package_name: string;
  attendedSessionCount: number;
};

export type CustomerView = {
  customer: {
    _id: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    nic: string;
    package_id: string;
    fee: number;
    isActive: boolean;
    isPaid: boolean;
  };
  paymentHistory: PaymemtnHistory[];
  packageHistory: PackageHistory[];
};

type PaymemtnHistory = {
  _id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  customerOrGroupId: string;
  amount: number;
  paymentFor: string;
  type: string;
  package_id: string;
  package: {
    _id: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    sessions_allocated: number;
    package_name: string;
  };
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
  package_id: string;
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