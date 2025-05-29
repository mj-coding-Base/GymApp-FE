export enum ClientType {
  GROUP = "Group",
  INDIVIDUAL = "Individual",
  EXTRA_PAYMENT = "Extra Payment"
}

export enum Status {
  PAID = "Paid",
}

export interface Payment {
  id: string;
  paymentDate: string;
  clientName: string;
  paidAmount: string;
  clientType: string;
  paymentType: string;
  status: string;
}