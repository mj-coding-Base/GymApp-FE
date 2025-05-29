export enum PaymentStatus {
  PAID = "PAID",
  NOT_PAID = "NOT_PAID",
}

export enum ClientType {
  INDIVIDUAL = "Individual",
  GROUP = "Group",
}

export const getPaymentStatusColor = (status: PaymentStatus): { bg: string; text: string } => {
  switch (status) {
    case PaymentStatus.PAID:
      return { bg: "#E3F5E5", text: "#1B5E20" }
    case PaymentStatus.NOT_PAID:
      return { bg: "#D32F2F", text: "white" }
    default:
      return { bg: "#E3F5E5", text: "#1B5E20" }
  }
}

export const getClientTypeColor = (type: ClientType): { bg: string; text: string } => {
  switch (type) {
    case ClientType.INDIVIDUAL:
      return { bg: "#BBC2FF", text: "#122DBC" }
    case ClientType.GROUP:
      return { bg: "#CDEDFF", text: "#005F95" }
    default:
      return { bg: "#CDEDFF", text: "#005F95" }
  }
}

export interface Session {
  _id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  customer_id: string;
  attendance: 'attended' | 'missed' | 'cancelled';
  trainer_id: string;
  current_session: number;
  isExtra: boolean;
  customer_name: string;
  trainer_name: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_nic: string;
  customer_phone: string;
}

export interface FetchSessionsParams {
  ids?: string[];
  searchTerm?: string;
  isActive?: boolean;
  customer_type?: 'individual' | 'group';
  group_id?: string;
  month?: number;
  year?: number;
  customer_id?: string;
  page?: number;
  size?: number;
}

export interface SessionsResponse {
  status: 'SUCCESS' | 'FAIL';
  message: string | null;
  data: Session[];
  total?: number;
}

export interface CreateExtraSessionDto {
  sessionDate: string;
  sessionStart: string;
  sessionStop: string;
  customerId: string;
  packageId: string;
}

export interface CreateSessionDto {
  sessionDate: string;
  sessionStart: string;
  sessionStop: string;
  customerId: string;
  packageId: string;
  repeatCount: number;
  repeatInterval: number;
}

export interface FindCustomerSessionsDto {
  customerNIC?: string;
  customerName?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}

export interface TrainerQueryParams {
  trainerNIC?: string;
  trainerName?: string;
  startDate?: string;
  endDate?: string;
}
export interface SessionSummary {
  currentMonth: string;
  startDate: string;
  today: string;
  currentSession: string;
  clientName: string;
  paymentStatus: "paid" | "unpaid";
  extraSessionCount: string;
  extraAmountPaid: string;
}


// types/SessionHistory.ts

export interface GroupSessionHistoryProps {
  groupId: string;
}
