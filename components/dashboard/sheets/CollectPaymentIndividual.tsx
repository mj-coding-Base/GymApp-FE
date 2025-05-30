"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
// import MonthSelector from "../MonthSelector";
import { useCollectPaymentIndividualSheet } from "@/hooks/useCollectPaymentIndividualSheet";
import { useExtraPaymentCollectionSheet } from "@/hooks/usePaymentCollectionExtra";
import { usePaymentCollectionIndividualSheet } from "@/hooks/usePaymentCollectionIndividualSheet";

const CollectPaymentIndividual = () => {
  const {
    openCollectPaymentIndividualSheet,
    setOpenCollectPaymentIndividualSheet,
  } = useCollectPaymentIndividualSheet();

  const { setOpenPaymentCollectionIndividualSheet } =
    usePaymentCollectionIndividualSheet();

  const { setOpenExtraPaymentCollectionSheet } =
    useExtraPaymentCollectionSheet();

  return (
    <Sheet
      open={openCollectPaymentIndividualSheet}
      onOpenChange={setOpenCollectPaymentIndividualSheet}
    >
      <SheetContent
        side="bottom"
        className="rounded-t-2xl min-h-120 max-h-[calc(100%-40px)]"
      >
        <SheetHeader className="gap-[20px]">
          <SheetTitle className="text-[14px] font-semibold text-[#363636] text-center">
            Collect Payment
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
          <p className="text-[11px] font-normal text-[#6D6D6D] text-center">
            showing results for
          </p>
          <div className="mt-[10px] border-[1px] border-[#000000] rounded-[12px] overflow-hidden">
            <div className="flex border-b-[1px] border-b-[#000000]">
              <div className="flex-[35%] shrink-0 px-[10px] py-[7.8px] content-center">
                <p className="text-[#6D6D6D] text-[12px] font-medium">
                  Current Session
                </p>
                <p className="text-[#3D3D3D] text-[12px] font-semibold">11</p>
              </div>
              <div className="flex-[40%] shrink-0 px-[10px] py-[7.8px] border-x-[1px] border-x-[#000000] content-center">
                {/* <MonthSelector /> */}
              </div>
              <div className="flex-[25%] shrink-0 px-[10px] py-[7.8px] content-center">
                <p className="text-[#6D6D6D] text-[12px] font-medium">Today</p>
                <p className="text-[#3D3D3D] text-[12px] font-semibold">
                  03/03/25
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-[45%] shrink-0 px-[10px] py-[7.8px] content-center">
                <p className="text-[#6D6D6D] text-[12px] font-medium">Name</p>
                <p className="text-[#3D3D3D] text-[12px] font-semibold">
                  Maria Fenando
                </p>
              </div>
              <div className="flex-[20%] shrink-0 px-[10px] py-[7.8px] border-x-[1px] border-x-[#000000] content-center">
                <p className="text-[#6D6D6D] text-[12px] font-medium">NIC</p>
                <p className="text-[#3D3D3D] text-[12px] font-semibold">
                  1234567890
                </p>
              </div>
              <div className="flex-[35%]  px-[10px] py-[7.8px]">
                <p className="text-[#6D6D6D] text-[12px] font-medium">
                  Payment
                </p>
                <p className="bg-[#D32F2F] text-center rounded-[15px] px-[0px] py-[5px] text-[#FFFFFF] text-[12px]/[100%] font-semibold">
                  Not Paid
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 border-[#E7E7E7] border-[1px] rounded-[15px] overflow-hidden">
            <div className=" flex bg-[#fac1be] px-[12px] py-[10px]">
              <p className="flex-1/2 text-center text-[12px] font-medium text-[#454545]">
                Session Count
              </p>
              <p className="flex-1/2 text-center text-[12px] font-medium text-[#454545]">
                Trainer
              </p>
            </div>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="flex px-[12px] py-[10px] border-t-[#E7E7E7] border-t-[1px]"
              >
                <p className="flex-1/2 text-center  text-[11px] font-medium text-[#434745]">
                  {item}
                </p>
                <p className="flex-1/2 text-center text-[11px] font-medium text-[#454545]">
                  John Doe
                </p>
              </div>
            ))}
          </div>
        </div>
        <SheetFooter className="grid grid-cols-2 gap-[15px]">
          <Button
            variant={"outline"}
            onClick={() => {
              setOpenCollectPaymentIndividualSheet(false);
              setOpenExtraPaymentCollectionSheet(true);
            }}
            className="border-[#69716C] rounded-[10px] text-[13px] font-semibold text-[#69716C] h-[40px]"
          >
            Extra Payment
          </Button>
          <Button
            type="submit"
            onClick={() => {
              setOpenCollectPaymentIndividualSheet(false);
              setOpenPaymentCollectionIndividualSheet(true);
            }}
            className="bg-[#363636] rounded-[10px] text-[13px] font-semibold text-[#FFFFFF]  h-[40px]"
          >
            Collect
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CollectPaymentIndividual;
