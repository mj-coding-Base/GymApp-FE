import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React, { useState, useEffect, useCallback } from "react";
import { Customer } from "@/types/Customer";
import IndividualCard from "./IndividualCard";
import { Button } from "@/components/ui/button";
import AddNewMember from "./AddNewMember";
import CustomPagination from "@/components/common/CustomPagination";
import { searchCustomers } from "@/actions/customers";
import { Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";

const Individual = ({ initialCustomers }: { initialCustomers: Customer[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
const handleSearch = useCallback(async (term: string) => {
  try {
    setIsSearching(true);
    const results = await searchCustomers(term);

    const mappedCustomers: Customer[] = results.data.map((item: any) => ({
      _id: item._id,
      name: `${item.first_name ?? ""} ${item.last_name ?? ""}`.trim(),
      nic: item.nic || "",
      email: item.email || "",
      mobileNumber: item.phone || "",
      packageId: item.package_id || "",
      status: item.status || "",
      isActive: item.isActive ?? false,
      createdAt: item.createdAt || "",
      updatedAt: item.updatedAt || "",
      isPaid: item.isPaid ?? false,
      packageName: "",
      groupMembersNames: [],
      type: "individual",
    }));

    setCustomers(mappedCustomers);
  } catch (error: any) {
    console.error("Search error:", error);
    toast.error(error.message || "Failed to search customers");
    setCustomers(initialCustomers);
  } finally {
    setIsSearching(false);
  }
}, [initialCustomers]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      handleSearch(debouncedSearchTerm);
    } else {
      setCustomers(initialCustomers);
    }
  }, [debouncedSearchTerm, initialCustomers, handleSearch]);

  return (
    <div className="w-full">
      <Card>
        <CardContent className="flex-col px-0">
          <div className="flex flex-col gap-[10px] mb-[15px] px-[15px]">
            <div className="relative flex-1">
              <i className="search-icon absolute left-3 top-2 size-[19.12px] text-[#9E9E9E]" />
              <Input
                className="pl-[40px] pr-4 rounded-[24px] text-[#9E9E9E] text-[12px] border-[#9E9E9E] border-[0.8px]"
                placeholder="Search by Full name/ NIC"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-2 h-4 w-4 animate-spin" />
              )}
            </div>
            <Button
              onClick={() => setIsOpen(true)}
              className="bg-[#44424D] text-[9.62px] flex w-full items-center justify-center rounded-[23.48px]"
            >
              <i className="plus-icon bg-[#44424D] text-[#FFFFFF] h-[15.4px] w-[15.4px]" />
              Add New Member
            </Button>
          </div>

          {customers.length > 0 ? (
            customers.map((customer) => (
              <IndividualCard key={customer._id} customer={customer} />
            ))
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              {isSearching ? "Searching..." : "No customers found"}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center mt-5">
        <div className="text-[11px] text-[#3D3D3D] mb-1">
          Showing {customers.length} results
        </div>
        <div className="flex items-center justify-center">
          <CustomPagination
            totalCount={500}
            className="flex items-center justify-center gap-2 pt-2"
          />
        </div>
      </div>
      <AddNewMember open={isOpen} setOpen={setIsOpen} data={null} />
    </div>
  );
};

export default Individual;