"use client";

import { getUserById } from "@/actions/customers";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CustomerView, IndividualCustomer } from "@/types/Customer";
import React, { useEffect, useState } from "react";

interface ViewClientProfileProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  customer: IndividualCustomer;
}

const ViewClientProfile = ({
  isOpen,
  setIsOpen,
  customer,
}: ViewClientProfileProps) => {
  const [paymentData, setPaymentData] = useState<CustomerView | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);

    getUserById(customer._id)
      .then((response) => {
        setPaymentData(response);
      })
      .finally(() => setLoading(false));
  }, [customer._id, isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="bottom"
        hideClose={true}
        className="rounded-t-2xl min-h-[600px] max-h-[calc(100%-40px)] px-[14px] pt-[14px] gap-0"
      >
        <SheetHeader className="hidden">
          <SheetTitle className="text-[14px] font-semibold text-[#363636] text-center">
            Client Profile
          </SheetTitle>
        </SheetHeader>
        <SheetClose className="flex gap-[5px] mb-[25px]">
          <i className="back-icon size-4 text-[#1D1B20]" />
          <p className="text-[11.2px]/[14px]">Back</p>
        </SheetClose>
        <h1 className="text-[14.4px]/[17px] font-medium text-[#363636] text-center">
          Client Profile
        </h1>
        <div className="overflow-y-auto">
          <div className="mt-[16px] border-[1px] border-[#000000] rounded-[12px] overflow-hidden">
            <div className="flex border-b-[1px] border-b-[#000000]">
              <div className="flex-[50%] shrink-0 px-[10px] py-[7.8px] content-center flex flex-col gap-[9px]">
                <p className="text-[#6D6D6D] text-[11.5px]/[14px] font-medium">
                  Name
                </p>
                <p className="text-[#3D3D3D] text-[12px]/[15px] font-semibold">
                  {`${customer.first_name} ${customer.last_name}`}
                </p>
              </div>
              <div className="flex-[50%] shrink-0 px-[10px] py-[7.8px] border-l-[1px] border-l-[#000000] content-center flex flex-col gap-[9px]">
                <p className="text-[#6D6D6D] text-[11.5px]/[14px] font-medium">
                  Email
                </p>
                <p className="text-[#3D3D3D] text-[12px]/[15px] font-semibold">
                  {customer.email}
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-[35%] shrink-0 px-[10px] py-[7.8px] content-center flex flex-col gap-[9px]">
                <p className="text-[#6D6D6D] text-[11.5px]/[14px] font-medium">
                  NIC
                </p>
                <p className="text-[#3D3D3D] text-[12px]/[15px] font-semibold">
                  {customer.nic}
                </p>
              </div>
              <div className="flex-[35%] shrink-0 px-[10px] py-[7.8px] border-x-[1px] border-x-[#000000] content-center flex flex-col gap-[9px]">
                <p className="text-[#6D6D6D] text-[11.5px]/[14px] font-medium">
                  Current Session
                </p>
                <p className="text-[#3D3D3D] text-[12px]/[15px] font-semibold">
                  {customer.attendedSessionCount}
                </p>
              </div>
              <div className="flex-[30%] shrink-0 px-[10px] py-[7.8px] content-center flex flex-col gap-[9px]">
                <p className="text-[#6D6D6D] text-[11.5px]/[14px] font-medium">
                  Mobile
                </p>
                <p className="text-[#3D3D3D] text-[12px]/[15px] font-semibold">
                  {customer.phone}
                </p>
              </div>
            </div>
          </div>
          <p className="mt-[16px] mb-[13.5px] text-[12px]/[15px] text-[#888888] font-semibold">
            Payment History
          </p>
          {loading ? (
            <div className="min-h-[500px] flex items-center justify-center">
              <i className="size-[45px] animate-spin loading-icon" />
            </div>
          ) : (
            <div className="border-[#EEEEEE] border-[0.9px] rounded-[15px] overflow-hidden">
              <div className=" flex bg-[#F5F5F5] px-[13.5px] py-[15.5px]">
                <p className="w-[29.5%] text-[11px]/[14px] font-medium text-[#212121]">
                  Payment Date
                </p>
                <p className="w-[41.3%] text-[11px]/[14px] font-medium text-[#212121]">
                  Package
                </p>
                <p className="w-[22.95%] text-[11px]/[14px] font-medium text-[#212121]">
                  Amount
                </p>
              </div>
              {paymentData?.paymentHistory.map((item) => (
                <div
                  key={item._id}
                  className="flex px-[13.5px] py-[18px] border-t-[#E7E7E7] border-t-[1px]"
                >
                  <p className="w-[29.5%] text-[12px]/[13.5px] font-normal text-[#212121]">
                    {item.createdAt}
                  </p>
                  <p className="w-[41.3%] text-[12px]/[13.5px] font-normal text-[#212121]">
                    {item.package.package_name}
                  </p>
                  <p className="w-[22.95%] text-[12px]/[13.5px] font-normal text-[#212121]">
                    LKR {item.amount}
                  </p>
                </div>
              ))}
            </div>
          )}

          <p className="mt-[16px] mb-[13.5px] text-[12px]/[15px] text-[#888888] font-semibold">
            Package History
          </p>
          {loading ? (
            <div className="min-h-[500px] flex items-center justify-center">
              <i className="size-[45px] animate-spin loading-icon" />
            </div>
          ) : (
            <div className="border-[#EEEEEE] border-[0.9px] rounded-[15px] overflow-hidden">
              <div className=" flex bg-[#F5F5F5] px-[13.5px] py-[15.5px]">
                <p className="w-[29.5%] text-[11px]/[14px] font-medium text-[#212121]">
                  Payment Date
                </p>
                <p className="w-[41.3%] text-[11px]/[14px] font-medium text-[#212121]">
                  Package
                </p>
                <p className="w-[22.95%] text-[11px]/[14px] font-medium text-[#212121]">
                  Amount
                </p>
              </div>
              {paymentData?.packageHistory.map((item) => (
                <div
                  key={item._id}
                  className="flex px-[13.5px] py-[18px] border-t-[#E7E7E7] border-t-[1px]"
                >
                  <p className="w-[29.5%] text-[12px]/[13.5px] font-normal text-[#212121]">
                    {item.createdAt}
                  </p>
                  <p className="w-[41.3%] text-[12px]/[13.5px] font-normal text-[#212121]">
                    {item.package.package_name}
                  </p>
                  <p className="w-[22.95%] text-[12px]/[13.5px] font-normal text-[#212121]">
                    LKR {item.amount}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ViewClientProfile;