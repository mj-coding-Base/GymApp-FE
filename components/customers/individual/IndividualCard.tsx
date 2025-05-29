"use client";

import { Badge } from "@/components/ui/badge";
import { Customer, CommonResponseDataType } from "@/types/Customer";
import React, { useState } from "react";
import ViewClientProfile from "./ClientProfile";
import AddNewMember from "./AddNewMember";
import { useActions } from "@/hooks/modals/useActions";
import {deactivateCustomer} from "@/actions/customers"
import { useSession } from "@/components/providers/SessionProvider";

interface Props {
  customer: Customer;
}

const IndividualCard = ({ customer }: Props) => {
  const session = useSession();
  const token = session?.user.token || ""; 
  const [isClientProfileOpen, setIsClientProfileOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const { handleAction } = useActions();

  const handleDeactivate = async (): Promise<CommonResponseDataType> => {
    const response = await deactivateCustomer(customer._id);

    if (typeof response === "string") {
      return {
        status: "SUCCESS",
        message: response,
        data: null,
      };
    }
    if (typeof response === "object" && response !== null) {
      if ('status' in response && (response.status === "SUCCESS" || response.status === "FAIL")) {
        return {
          status: response.status,
          message: response.message ?? "",
          data: 'data' in response ? (response as { data: null }).data : null,
        };
      }
      return {
        status: "SUCCESS",
        message: typeof response.message === "string" ? response.message : "",
        data: 'data' in response ? (response as { data: null }).data : null,
      };
    }
    return {
      status: "SUCCESS",
      message: "Operation completed successfully",
      data: null,
    };
  };

  const formatedDate = new Date(customer.createdAt).toISOString().split('T')[0];

  return (
    <div className="border border-b border-[#DAD9DE] p-[15px] bg-white relative">
      <div className="flex flex-col gap-[15px]">
        <div className="flex gap-9">
          <div className="flex flex-col gap-[5px]">
            <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">
              Date Registered
            </p>
            <p className="text-[12px]/[15px] text-[#434745] font-medium">
              {formatedDate}
            </p>
          </div>
          <div className="flex flex-col gap-[5px]">
            <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">
              Status
            </p>
            <Badge
              variant={customer.status === "ACTIVE" ? "success" : "destructive"}
              className="rounded-[15px] text-[11px]/[13px] font-semibold"
            >
              {customer.status === "ACTIVE" ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-[5px]">
          <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">NIC</p>
          <p className="text-[12px]/[15px] text-[#434745] font-medium">
            {customer.nic}
          </p>
        </div>

        <div className="flex flex-col gap-[5px]">
          <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">
            Client Name
          </p>
          <p className="text-[12px]/[15px] text-[#434745] font-medium">
            {customer.name}
          </p>
        </div>

        <div className="flex flex-col gap-[5px]">
          <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">
            Mobile Number
          </p>
          <p className="text-[12px]/[15px] text-[#434745] font-medium">
            {customer.mobileNumber}
          </p>
        </div>

        <div className="flex flex-col gap-[5px]">
          <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">Email</p>
          <p className="text-[12px]/[15px] text-[#434745] font-medium">
            {customer.email}
          </p>
        </div>
      </div>

      <div className="absolute right-0 inset-y-0 flex flex-col gap-[10px] items-center justify-center">
        <i
          onClick={() => {
            setIsClientProfileOpen(true);
          }}
          className="view-details w-[36.26px] h-[50px]"
        />
        <i
          onClick={() => {
            setIsUpdateOpen(true);
          }}
          className="edit-with-bg w-[36.26px] h-[50px]"
        />
      <i
        role="button"
        tabIndex={0}
        aria-label="Deactivate customer"
        onClick={() => {
            handleAction(
              handleDeactivate,
              `Are you sure you want to deactivate this client?`,
              `The client has been successfully deactivated!`,
              "Deactivate",
              "Done",
              undefined,
              "red"
            );
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleAction(
              async () => {
                const response = await deactivateCustomer(customer._id);
                if (typeof response === "string") {
                  return {
                    status: "SUCCESS" as const,
                    message: response,
                    data: null,
                  };
                }
                if ('status' in response && (response.status === "SUCCESS" || response.status === "FAIL")) {
                  return {
                    status: response.status,
                    message: response.message ?? "",
                    data: 'data' in response ? (response ).data : null,
                  };
                }
                return {
                  status: "SUCCESS" as const,
                  message: typeof response.message === "string" ? response.message : "",
                  data: 'data' in response ? (response as { data: null } ).data : null,
                };
              },
              `Are you sure you want to deactivate this client?`,
              `The client has been successfully deactivated!`,
              "Deactivate",
              "Done",
              undefined,
              "red"
            );
          }
        }}
        className="deactivate-customer w-[36.26px] h-[50px]"
      />
      </div>

      <ViewClientProfile
        isOpen={isClientProfileOpen}
        setIsOpen={setIsClientProfileOpen}
        customer={customer}
      />

      <AddNewMember
        open={isUpdateOpen}
        setOpen={setIsUpdateOpen}
        data={customer}
      />
    </div>
  );
};

export default IndividualCard;
