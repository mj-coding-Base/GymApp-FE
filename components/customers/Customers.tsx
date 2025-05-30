"use client";
import React from "react";
import CustomTabs from "../common/CustomTabs";
import Individual from "./individual/Individual";
import Group from "./group/Group";
import { GroupCustomer, IndividualCustomer } from "@/types/Customer";

interface Props {
  searchParams: {
    page?: string;
    size?: string;
    search?: string;
    type?: string;
  };
  individuals: { results: IndividualCustomer[]; totalResults: number };
  groups: { results: GroupCustomer[]; totalResults: number };
}

const Customers = ({ searchParams, individuals, groups }: Props) => {
  const tabsData = () => [
    {
      title: "Individual",
      value: "individual",
      path: "/customers",
      content: () => <Individual individualCustomers={individuals} />,
      className: "w-[110px] lg:w-[112.5px] 3xl:w-[150px]",
    },
    {
      title: "Group",
      value: "group",
      path: "/customers/?type=group",
      content: () => <Group groups={groups} />,
      className: "w-[110px] lg:w-[112.5px] 3xl:w-[150px]",
    },
  ];

  const { type } = searchParams;

  return <CustomTabs tabsData={tabsData()} type={type} path="/customers" />;
};

export default Customers;