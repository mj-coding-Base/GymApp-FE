export type Package = {
  packageId: string;         // corresponds to "_id"
  package_name: string;       // corresponds to "name"
  description: string;
  sessionCount: number;      // corresponds to "sessions"
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  status: string;
};

export interface PackageData {
  id: string;
  dateCreated: string;
  package_name: string;
  sessions: number;
  members: number;
}

export interface MemberData {
  id: string;
  dateRegistered: string;
  clientName: string;
  currentSession: number;
  clientType: "Individual" | "Group";
  nic: string;
}