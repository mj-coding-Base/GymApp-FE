"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
// import MonthSelector from "../MonthSelector";
import { useCollectPaymentGroupSheet } from "@/hooks/useCollectPaymentGroupSheet";
import { useExtraPaymentCollectionSheet } from "@/hooks/usePaymentCollectionExtra";
import { usePaymentCollectionGroupSheet } from "@/hooks/usePaymentCollectionGroupSheet";
import { usePaymentCollectionIndividualSheet } from "@/hooks/usePaymentCollectionIndividualSheet";
import {
    CollectGroupPayment,
    PaymentStatus,
} from "@/types/CollectGroupPayment";

const CollectPaymentGroup = () => {
  const payments: CollectGroupPayment[] = [
    {
      id: 1,
      name: "Mahesh Karunarathna",
      nic: "123456789",
      session: "12",
      paymentStatus: PaymentStatus.NOT_PAID,
    },
    {
      id: 2,
      name: "Mahesh Karunarathna",
      nic: "123456789",
      session: "12",
      paymentStatus: PaymentStatus.NOT_PAID,
    },
    {
      id: 3,
      name: "Mahesh Karunarathna",
      nic: "123456789",
      session: "12",
      paymentStatus: PaymentStatus.PAID,
    },
  ];

  const { openCollectPaymentGroupSheet, setOpenCollectPaymentGroupSheet } =
    useCollectPaymentGroupSheet();

  const { setOpenPaymentCollectionGroupSheet } =
    usePaymentCollectionGroupSheet();

  const { setOpenExtraPaymentCollectionSheet } =
    useExtraPaymentCollectionSheet();

  const { setOpenPaymentCollectionIndividualSheet } =
    usePaymentCollectionIndividualSheet();

  return (
    <Sheet
      open={openCollectPaymentGroupSheet}
      onOpenChange={setOpenCollectPaymentGroupSheet}
    >
      <SheetContent
        side="bottom"
        className="rounded-t-2xl min-h-120 max-h-[calc(100%-40px)]"
      >
        <SheetHeader className="gap-5">
          <SheetTitle className="text-[14px] font-semibold text-[#363636] text-center">
            Collect Payment from Group
          </SheetTitle>
          <SheetDescription className="relative w-full max-w-sm">
            <i className="search-icon  w-[16.54px] h-[18.9px] text-[#000000] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search by Full name/ NIC"
              className="pl-10 text-[11px] font-normal text-[#4F4F4F]"
            />
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 overflow-y-auto">
          <div className="border-[1px] border-[#000000] rounded-[12px] flex overflow-hidden">
            <div className="flex-[65%] px-[10px] py-[7.8px] content-center">
              {/* <MonthSelector /> */}
            </div>
            <div className="flex-[35%] px-[10px] py-[7.8px] content-center border-l-[#000000] border-l-[1px]">
              <p className="text-[#6D6D6D] text-[12px] font-medium">Today</p>
              <p className="mt-[13px] text-[#3D3D3D] text-[12px] font-semibold">
                03/03/25
              </p>
            </div>
          </div>
          <div className="mt-5 border-[#E7E7E7] border-[1px] rounded-[15px] overflow-hidden">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex border-t-[#E7E7E7] border-t-[1px]"
              >
                <div className="flex-2/3 flex px-[12px] py-[10px] border-r-[1px] border-r-[#E7E7E7]">
                  <div className="flex-1/2 shrink-0 flex flex-col">
                    <p className="text-[11px] font-medium text-[#5D5D5D]">
                      # Name
                    </p>
                    <p className="text-[13px] font-medium text-[#434745]">
                      {payment.name} Raj Ayesh
                    </p>
                    <p className="mt-[10px] text-[11px] font-medium text-[#5D5D5D]">
                      Current Session
                    </p>
                    <p className="text-[13px] font-medium text-[#434745]">
                      {payment.session}
                    </p>
                  </div>
                  <div className="flex-1/2 shrink-0 flex flex-col">
                    <p className="text-[11px] font-medium text-[#5D5D5D]">
                      NIC
                    </p>
                    <p className="text-[13px] font-medium text-[#434745]">
                      {payment.nic}
                    </p>
                    <p className="mt-[10px] text-[11px] font-medium text-[#5D5D5D]">
                      Payment Status
                    </p>
                    <div>
                      <p
                        className={`${
                          payment.paymentStatus == PaymentStatus.NOT_PAID
                            ? "bg-[#D32F2F]"
                            : "bg-[#F04237]"
                        } text-[10px]/[100%] font-medium text-[#FFFFFF] w-fit rounded-[15px] px-[10px] py-[5px]`}
                      >
                        {payment.paymentStatus}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-1/3 px-[12px] py-[10px] shrink-0 text-center text-[11px] font-medium text-[#454545] flex flex-col gap-[15px]">
                  <Button
                    variant={"default"}
                    onClick={() => {
                      setOpenCollectPaymentGroupSheet(false);
                      setOpenPaymentCollectionIndividualSheet(true);
                    }}
                    className="bg-[#EFEEF0] text-[10.8px]/[100%] text-[#757575] px-2 py-1 break-words whitespace-normal text-wrap"
                  >
                    Collect Payment
                  </Button>
                  <Button
                    variant={"default"}
                    onClick={() => {
                      setOpenCollectPaymentGroupSheet(false);
                      setOpenExtraPaymentCollectionSheet(true);
                    }}
                    className="bg-[#DAD9DE] text-[10.8px]/[100%] text-[#757575] px-2 py-1 break-words whitespace-normal text-wrap"
                  >
                    Collect Extra Payment
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <SheetFooter className="w-full items-center">
          <SheetClose asChild className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setOpenCollectPaymentGroupSheet(false);
                setOpenPaymentCollectionGroupSheet(true);
              }}
              className="border-[#454545] rounded-[12px] text-[14px] font-semibold text-[#3D3D3D] h-[40px] w-fit"
            >
              Collect Group Payment
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CollectPaymentGroup;
