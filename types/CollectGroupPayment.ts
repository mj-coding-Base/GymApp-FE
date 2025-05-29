export enum PaymentStatus {
  PAID = "Paid",
  NOT_PAID = "Not Paid",
}

export interface CollectGroupPayment {
  id: number;
  name: string;
  nic: string;
  session: string;
  paymentStatus: PaymentStatus;
}
