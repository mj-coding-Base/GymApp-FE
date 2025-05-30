import {
  fetchIndividualCustomers,
  fetchGroupCustomers,
} from "@/actions/customers";
import Customers from "@/components/customers/Customers";
import { GroupCustomer, IndividualCustomer } from "@/types/Customer";
import React from "react";

interface Props {
  searchParams: Promise<{
    page?: string;
    size?: string;
    search?: string;
    type?: string;
  }>;
}

export default async function Page({ searchParams }: Props) {
  const searchparams = await searchParams;

  const type = searchparams.type;

  let individualCustomers: {
    results: IndividualCustomer[];
    totalResults: number;
  } = { results: [], totalResults: 0 };

  let groupCustomers: { results: GroupCustomer[]; totalResults: number } = {
    results: [],
    totalResults: 0,
  };

  if (type === "group") {
    groupCustomers = await fetchGroupCustomers(
      searchparams.page ?? "1",
      "10",
      searchparams.search,
      undefined,
      true
    );
  } else {
    individualCustomers = await fetchIndividualCustomers(
      searchparams.page ?? "1",
      "10",
      searchparams.search
    );
  }

  return (
    <Customers
      individuals={individualCustomers}
      groups={groupCustomers}
      searchParams={searchparams}
    />
  );
}