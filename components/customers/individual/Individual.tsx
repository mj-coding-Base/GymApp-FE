"use client";

import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";
import { IndividualCustomer } from "@/types/Customer";
import IndividualCard from "./IndividualCard";
import { Button } from "@/components/ui/button";
import AddNewMember from "./AddNewMember";
import CustomPagination from "@/components/common/CustomPagination";
import CommonSearch from "@/components/common/Search";

const Individual = ({
  individualCustomers,
}: {
  individualCustomers: { results: IndividualCustomer[]; totalResults: number };
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <Card>
        <CardContent className="flex-col px-0">
          <div className="flex flex-col gap-[10px] mb-[15px] px-[15px]">
            <CommonSearch />

            <Button
              onClick={() => setIsOpen(true)}
              className="bg-[#44424D] text-[9.62px] flex w-full items-center justify-center rounded-[23.48px]"
            >
              <i className="plus-icon bg-[#44424D] text-[#FFFFFF] h-[15.4px] w-[15.4px]" />
              Add New Member
            </Button>
          </div>

          {individualCustomers.results.length > 0 ? (
            individualCustomers.results.map((customer) => (
              <IndividualCard key={customer._id} customer={customer} />
            ))
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No customers found
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center mt-5">
        <div className="text-[11px] text-[#3D3D3D] mb-1">
          Showing results {individualCustomers.results.length}/
          {individualCustomers.totalResults}
        </div>
        <div className="flex items-center justify-center">
          <CustomPagination
            totalCount={individualCustomers.totalResults}
            className="flex items-center justify-center gap-2 pt-2"
          />
        </div>
      </div>
      <AddNewMember open={isOpen} setOpen={setIsOpen} data={null} />
    </div>
  );
};

export default Individual;