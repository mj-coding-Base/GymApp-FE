"use client";

import { useCollectPaymentGroupSheet } from "@/hooks/useCollectPaymentGroupSheet";
import { useCollectPaymentIndividualSheet } from "@/hooks/useCollectPaymentIndividualSheet";
import WhiteCard from "./WhiteCard";

const CollectPayment = () => {
  const { setOpenCollectPaymentIndividualSheet } =
    useCollectPaymentIndividualSheet();

  const { setOpenCollectPaymentGroupSheet } = useCollectPaymentGroupSheet();

  return (
    <WhiteCard className="flex flex-col gap-[10px] items-center">
      <i className="collect-payment-icon size-[25px] text-[#5D5D5D]" />
      <p className="text-[12px] font-medium text-[#5D5D5D]">Collect Payment</p>
      <div className="grid grid-cols-2 gap-[10px] w-full">
        <div
          onClick={() => {
            setOpenCollectPaymentIndividualSheet(true);
          }}
          className="flex flex-col items-center justify-between bg-[#fac1be] rounded-[15px] py-[18px] gap-[6px]"
        >
          <i className="individual-icon  w-[16.54px] h-[18.9px] text-[#000000]" />
          <p className="text-[13px] font-medium text-[#454545]">Individual</p>
        </div>
        <div
          onClick={() => {
            setOpenCollectPaymentGroupSheet(true);
          }}
          className="flex flex-col items-center justify-between bg-[#fac1be] rounded-[15px]  py-[18px] gap-[6px]"
        >
          <i className="group-icon w-[23.63px] h-[18.9px] text-[#000000]" />
          <p className="text-[13px] font-medium text-[#454545]">Group</p>
        </div>
      </div>
    </WhiteCard>
  );
};

export default CollectPayment;
