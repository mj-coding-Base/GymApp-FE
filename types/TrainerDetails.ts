export enum Type {
  PART_TIME = "Part Time",
  FULL_TIME = "Full Time",
}

export enum Status {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}

export interface Trainer {
  id: string
  registeredDate: string
  type: Type
  status: Status
  trainerName: string
  nic: string
  email: string
  mobile: string
  profileImage?: string;
}

export enum PaymentStatus {
  PAID = "Paid",
  NOT_PAID = "Not Paid",
}

export interface Salaries {
  id: number
  date: string
  trainerName: string
  currentSession: string
  totalSalary: string
  type: string
  status: string
}

