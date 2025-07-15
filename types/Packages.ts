export type Package = {
  package_name: string;
  description: string;
  sessions: number;
  durationDays: number;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  packageId: string;
};

// export interface PackageData {
//   id: string;
//   dateCreated: string;
//   package_name: string;
//   sessions: number;
//   members: number;
// }

// export interface MemberData {
//   id: string;
//   dateRegistered: string;
//   clientName: string;
//   currentSession: number;
//   clientType: "Individual" | "Group";
//   nic: string;
// }