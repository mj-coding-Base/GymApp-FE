"use client";

import { fetchPendingPaymentCustomers, PendingPaymentCustomer } from "@/actions/dashboard/pendingPayments";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { usePendingPaymentsSheet } from "@/hooks/usePendingPaymentsSheet";
import useUserDetails from "@/hooks/useUserDetails";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useEffect, useState } from "react";
import WhiteCard from "./WhiteCard";

const PendingPayments = () => {
  const { openPendingPaymentsSheet, setOpenPendingPaymentsSheet } = usePendingPaymentsSheet();
  const { user } = useUserDetails();
  const isAdmin = user?.isAdmin === true || user?.isAdmin === "true" || user?.isAdmin === 1;
  
  const [allCustomers, setAllCustomers] = useState<PendingPaymentCustomer[]>([]); // Store all customers
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);

  // Calculate client-side pagination
  const totalCount = allCustomers.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  
  // Get customers for current page (client-side pagination)
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const customers = allCustomers.slice(startIndex, endIndex);

  const fetchData = async (search: string = "") => {
    setIsLoading(true);
    try {
      console.log(`Fetching all customers, search: "${search}"`);
      // Fetch ALL customers (API doesn't support pagination properly)
      const data = await fetchPendingPaymentCustomers(1, 2000, search);
      console.log(`Received: ${data.customers.length} total customers`);
      setAllCustomers(data.customers);
      setCurrentPage(1); // Reset to first page
    } catch (error) {
      console.error("Error fetching pending payments:", error);
      setAllCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (openPendingPaymentsSheet) {
      // Fetch all customers when opening
      setCurrentPage(1);
      setSearchTerm("");
      fetchData("");
    }
  }, [openPendingPaymentsSheet]);

  const handlePageChange = (newPage: number) => {
    console.log(`handlePageChange: Changing to page ${newPage} (CLIENT-SIDE)`);
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearch = (value: string) => {
    console.log(`Search: "${value}"`);
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
    fetchData(value);
  };

  const handlePageSizeChange = (newSize: number) => {
    console.log(`Page size changed to: ${newSize}`);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page on size change
  };

  const goToFirstPage = () => {
    console.log('Going to first page');
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    console.log(`Going to last page: ${totalPages}`);
    setCurrentPage(totalPages);
  };

  return (
    <Sheet open={openPendingPaymentsSheet} onOpenChange={setOpenPendingPaymentsSheet}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl min-h-[500px] max-h-[calc(100%-40px)] overflow-hidden flex flex-col"
      >
        <SheetHeader className="gap-3 flex-shrink-0 pb-3">
          <SheetTitle className="text-[16px] font-semibold text-[#363636]">
            Payment Pending Customers
          </SheetTitle>
          <p className="text-[12px] text-[#6D6D6D]">
            {totalCount || customers.length} unpaid customers with expired or empty deactivation dates
          </p>
          
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, ID, or mobile..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-[10px] text-[12px] focus:outline-none focus:ring-2 focus:ring-[#F04237] focus:border-transparent"
            />
            <i className="search-icon absolute right-3 top-1/2 -translate-y-1/2 size-[16px] text-[#6D6D6D]" />
          </div>
        </SheetHeader>

        {/* Pagination Controls - Below Search Bar */}
        {(totalCount > 0 || customers.length > 0) && (
          <div className="flex-shrink-0 px-6 py-4 space-y-3 bg-gray-50 border-y-2 border-gray-200">
            {/* Top Row: Info and Page Size Selector */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-[13px] font-semibold text-[#3D3D3D]">
                Showing {customers.length > 0 ? ((currentPage - 1) * pageSize + 1) : 0} to {Math.min(currentPage * pageSize, totalCount || customers.length)} of {totalCount || customers.length}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[#3D3D3D]">Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="text-[13px] font-semibold px-3 py-2 border-2 border-gray-400 rounded-[8px] bg-white text-[#3D3D3D] focus:outline-none focus:ring-2 focus:ring-[#F04237] focus:border-[#F04237] cursor-pointer shadow-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Navigation Buttons */}
            {totalPages >= 1 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {/* First Page Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('First page button clicked!');
                      goToFirstPage();
                    }}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center size-10 rounded-[8px] bg-[#4F4F4F] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#3D3D3D] active:bg-[#2A2A2A] transition-colors shadow-md border-2 border-[#3D3D3D]"
                    title="First page"
                    type="button"
                  >
                    <ChevronsLeft className="size-5" />
                  </button>
                  
                  {/* Previous Page Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Previous button clicked!');
                      handlePageChange(currentPage - 1);
                    }}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center size-10 rounded-[8px] bg-[#4F4F4F] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#3D3D3D] active:bg-[#2A2A2A] transition-colors shadow-md border-2 border-[#3D3D3D]"
                    title="Previous page"
                    type="button"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={(e) => {
                            e.preventDefault();
                            console.log(`Page ${pageNum} button clicked!`);
                            handlePageChange(pageNum);
                          }}
                          className={`size-10 rounded-[8px] text-[14px] font-bold transition-all border-2 ${
                            currentPage === pageNum
                              ? 'bg-[#F04237] text-white scale-110 shadow-lg border-[#D93A2F]'
                              : 'bg-white text-[#3D3D3D] hover:bg-[#E9ECEF] active:bg-[#D1D1D1] shadow-md border-gray-400'
                          }`}
                          title={`Page ${pageNum}`}
                          type="button"
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Page Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Next button clicked!');
                      handlePageChange(currentPage + 1);
                    }}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center size-10 rounded-[8px] bg-[#4F4F4F] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#3D3D3D] active:bg-[#2A2A2A] transition-colors shadow-md border-2 border-[#3D3D3D]"
                    title="Next page"
                    type="button"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                  
                  {/* Last Page Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Last page button clicked!');
                      goToLastPage();
                    }}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center size-10 rounded-[8px] bg-[#4F4F4F] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#3D3D3D] active:bg-[#2A2A2A] transition-colors shadow-md border-2 border-[#3D3D3D]"
                    title="Last page"
                    type="button"
                  >
                    <ChevronsRight className="size-5" />
                  </button>
                </div>
                
                {/* Page Info */}
                <p className="text-[13px] text-center font-bold text-[#3D3D3D]">
                  Page {currentPage} of {totalPages}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 pb-4 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-3">
                <i className="loading-icon size-[40px] animate-spin text-[#F04237]" />
                <p className="text-[14px] font-bold text-[#F04237]">Loading page {currentPage}...</p>
              </div>
            </div>
          )}
          
          {!isLoading && customers.length > 0 && (
            <div className="space-y-3 mt-4">
              {customers.map((customer) => (
                <WhiteCard key={customer._id} className="p-4">
                  <div className="space-y-3">
                    {/* Customer Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#fac1be] rounded-full flex items-center justify-center">
                          <span className="text-[14px] font-semibold text-[#F04237]">
                            {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-[#3D3D3D]">
                            {customer.firstName} {customer.lastName}
                          </p>
                          <p className="text-[11px] text-[#6D6D6D]">
                            ID: {customer.clientId}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-2 py-1 rounded-[6px] ${
                          customer.isPaid ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <p className={`text-[11px] font-bold ${
                            customer.isPaid ? 'text-green-700' : 'text-[#F04237]'
                          }`}>
                            {customer.isPaid ? 'PAID' : 'UNPAID'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-[#6D6D6D] mb-1">Package ID</p>
                        <p className="text-[12px] font-medium text-[#3D3D3D]">
                          {customer.packageId}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#6D6D6D] mb-1">Status</p>
                        <p className="text-[12px] font-medium text-[#3D3D3D]">
                          {customer.status}
                        </p>
                      </div>
                      {isAdmin && (
                        <div>
                          <p className="text-[10px] text-[#6D6D6D] mb-1">Mobile</p>
                          <p className="text-[12px] font-medium text-[#3D3D3D]">
                            {customer.mobileNumber}
                          </p>
                        </div>
                      )}
                      {isAdmin && (
                        <div>
                          <p className="text-[10px] text-[#6D6D6D] mb-1">Email</p>
                          <p className="text-[12px] font-medium text-[#3D3D3D] truncate">
                            {customer.email}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] text-[#6D6D6D] mb-1">Deactivate Date</p>
                        <p className="text-[12px] font-medium text-[#F04237]">
                          {customer.deactivateAt ? new Date(customer.deactivateAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          }) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#6D6D6D] mb-1">Profession</p>
                        <p className="text-[12px] font-medium text-[#3D3D3D] truncate">
                          {customer.profession}
                        </p>
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <p className="text-[10px] text-[#6D6D6D] mb-1">Address</p>
                      <p className="text-[12px] font-medium text-[#3D3D3D]">
                        {customer.addressLine1}, {customer.addressLine2}
                      </p>
                    </div>

                    {/* Action Button */}
                    {/* <button
                      onClick={() => {
                        console.log("Collect payment for:", customer.clientId);
                      }}
                      className="w-full bg-[#F04237] text-white rounded-[10px] py-2 text-[12px] font-semibold hover:bg-[#D93A2F] transition-colors"
                    >
                      Collect Payment
                    </button> */}
                  </div>
                </WhiteCard>
              ))}
            </div>
          )}
          
          {!isLoading && customers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <i className="total-client size-[48px] text-[#9CA3AF] mb-3" />
              <p className="text-[14px] text-[#6D6D6D] text-center">
                No pending payment customers found
              </p>
              <p className="text-[12px] text-[#9CA3AF] text-center mt-1">
                {searchTerm ? "Try a different search term" : "All customers are up to date!"}
              </p>
            </div>
          )}
        </div>

      </SheetContent>
    </Sheet>
  );
};

export default PendingPayments;

