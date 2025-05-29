import {
  fetchIndividualCustomers,
  fetchGroupCustomers,
} from "@/actions/customers";
import Customers from "@/components/customers/Customers";
import { Customer, FetchedCustomer } from "@/types/Customer";
import React from "react";

interface Props {
  searchParams: Promise<{
    page?: string;
    items?: string;
    search?: string;
    isActive?: string;
    type?: string;
  }>;
}

export default async function Page({ searchParams }: Props) {
  const searchparams = await searchParams;

  try {
    const { data: individualData } = await fetchIndividualCustomers();
    const individuals: Customer[] = individualData.map(
      (customer: FetchedCustomer) => ({
        _id: customer._id,
        name: `${customer.first_name ?? ""} ${customer.last_name ?? ""}`,
        nic: customer.nic ?? "",
        email: customer.email ?? "",
        mobileNumber: customer.phone ?? "",
        packageId: customer.package_id ?? "",
        status: customer.status ?? "",
        isActive: customer.isActive ?? false,
        createdAt: customer.createdAt ?? "",
        updatedAt: customer.updatedAt ?? "",
        isPaid: customer.isPaid ?? false,
        packageName: "",
        groupMembersNames: [],
        type: "individual",
      })
    );

    const { data: groups } = await fetchGroupCustomers();

    return (
      <Customers
        individuals={individuals}
        groups={groups}
        searchParams={{
          page:
            typeof searchparams?.page === "string"
              ? searchparams.page
              : undefined,
          items:
            typeof searchparams?.items === "string"
              ? searchparams.items
              : undefined,
          search:
            typeof searchparams?.search === "string"
              ? searchparams.search
              : undefined,
          type:
            typeof searchparams?.type === "string"
              ? searchparams.type
              : undefined,
        }}
      />
    );
  } catch (error) {
    console.error("Page fetch error:", error);
    return <div>Error loading customers</div>;
  }
}
