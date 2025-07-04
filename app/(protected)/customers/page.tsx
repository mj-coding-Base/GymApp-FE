import {
  fetchIndividualCustomers,
  fetchGroups,
} from "@/actions/customers";
import Customers from "@/components/customers/Customers";
import { GroupShort, IndividualCustomer } from "@/types/Customer";
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

  let groupCustomers: { results: GroupShort[]; totalResults: number } = {
    results: [],
    totalResults: 0,
  };

  if (type === "group") {
    console.log("fetching group customers++++++++++++")
    groupCustomers = await fetchGroups(
      searchparams.page ?? "1",
      "10",
      searchparams.search,
      undefined,
      true
    );
  } else {
    console.log("fetching individual customers++++++++++++")
    individualCustomers = await fetchIndividualCustomers(
      searchparams.page ?? "1",
      "10",
      searchparams.search
    );
      console.log("fuck ",individualCustomers.totalResults );
  }

  return (
    <Customers
      individuals={individualCustomers}
      groups={groupCustomers}
      searchParams={searchparams}
    />
  );
}