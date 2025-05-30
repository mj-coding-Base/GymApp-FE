import { Badge } from "@/components/ui/badge";
import { Payment } from "@/types/ClientPayment";
import React from "react";

export const ClientPaymentInfo: React.FC = () => {
  const payments: Payment[] = [
    {
      id: "1",
      paymentDate: "10/03/25",
      clientName: "Raj Ayesh",
      paidAmount: "45000",
      clientType: "Individual",
      paymentType: "Extra Payment",
      status: "Paid",
    },
    {
      id: "2",
      paymentDate: "10/03/25",
      clientName: "Mahesh Karunarathna",
      paidAmount: "10000",
      clientType: "Individual",
      paymentType: "Individual",
      status: "Paid",
    },
    {
      id: "3",
      paymentDate: "10/03/25",
      clientName: "Mahesh Karunarathna",
      paidAmount: "45000",
      clientType: "Group",
      paymentType: "Group",
      status: "Paid",
    },
    {
      id: "4",
      paymentDate: "10/03/25",
      clientName: "Mahesh Karunarathna",
      paidAmount: "10000",
      clientType: "Individual",
      paymentType: "Individual",
      status: "Paid",
    },
    {
      id: "5",
      paymentDate: "10/03/25",
      clientName: "Mahesh Karunarathna",
      paidAmount: "10000",
      clientType: "Group",
      paymentType: "Extra Payment",
      status: "Paid",
    },
  ];

  return (
    <div className="flex flex-col">
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="border border-gray-200  bg-white pb-2 pt-2 px-4"
        >
          <div className="flex mb-2">
            <div className="flex-1">
              <div className="text-[13px] text-[#6D6D6D]">Payment Date</div>
              <div className="text-[13px] text-[#434745]">
                {payment.paymentDate}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-[13px] text-[#6D6D6D]">Client Name</div>
              <div className="text-[13px] text-[#434745]">
                {payment.clientName}
              </div>
            </div>
          </div>

          <div className="flex mb-2">
            <div className="flex-1">
              <div className="text-[13px] text-[#6D6D6D]">Client Type</div>
              <div>
                <Badge
                  className={`mt-1 ${
                    payment.clientType === "Group"
                      ? "bg-[#CDEDFF] text-[#005F95] w-[75px] h-[25px] rounded-[36px] text-[12px]"
                      : "bg-[#BBC2FF] text-[#122DBC] w-[75px] h-[25px] rounded-[36px] text-[12px]"
                  } rounded-full px-3 py-1`}
                >
                  {payment.clientType}
                </Badge>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-[13px] text-[#6D6D6D]">Payment Type</div>
              <div>
                <Badge
                  className={`mt-1 ${
                    payment.paymentType === "Extra Payment"
                      ? "bg-[#9DDCFF] text-[#30247D] w-[103px] h-[25px] rounded-[36px] text-[12px]"
                      : payment.paymentType === "Group"
                      ? "bg-[#A0FFEE] text-[#0E5B4D] w-[75px] h-[25px] rounded-[36px] text-[12px]"
                      : "bg-[#FBD759] text-[#8C6500] w-[75px] h-[25px] rounded-[36px] text-[12px]"
                  } rounded-full px-3 py-1`}
                >
                  {payment.paymentType}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex">
            <div className="flex-1">
              <div className="text-[13px] text-[#6D6D6D]">Paid Amount</div>
              <div className="text-[13px] text-[#434745]">
                {payment.paidAmount}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-[13px] text-[#6D6D6D]">Status</div>
              <div>
                <Badge className="mt-1 bg-[#F04237] text-white rounded-full px-3 py-1 w-[44px] h-[18px] text-[12px]">
                  {payment.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientPaymentInfo;
