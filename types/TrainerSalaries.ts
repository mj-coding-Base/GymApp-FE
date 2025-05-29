export enum ClientType {
  PART_TIME = "Part Time",
 FULL_TIME= "Full Time",
}

export enum Status {
  PAID = "Paid",
  NOT_PAID = "Not Paid"
}

export interface Salaries {
  id: number;
  date: string;
  trainerName: string;
  currentSession: string;
  totalSalary: string;
  type: string;
  status: string;
}
