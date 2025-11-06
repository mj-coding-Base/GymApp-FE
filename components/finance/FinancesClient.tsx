"use client";

import { fetchAllPayments, FetchPaymentsFilters, PaymentResponse } from "@/actions/clientPayment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWarningModal } from "@/hooks/modals/useWarningModal";
import { cn } from "@/lib/utils";
import { generatePaymentsPDF } from "@/utils/pdfGenerator";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Download, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import FinancesSkeleton from "./FinancesSkeleton";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function FinancesClient() {
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  
  const [filters, setFilters] = useState<Partial<FetchPaymentsFilters>>({});
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined
  );
  
  const { setOpenWarningModal, setWarningData } = useWarningModal();

  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true);
      try {
        const result = await fetchAllPayments({
          ...filters,
          page,
          size: pageSize,
        });
        setPayments(result.payments);
        setTotalCount(result.totalCount);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error("Error loading payments:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [filters, page, pageSize]);

  const handleFilterChange = (key: string, value: string | number | boolean | undefined) => {
    // Convert empty strings to undefined to properly clear filters
    const filterValue = value === "" ? undefined : value;
    setFilters(prev => ({ ...prev, [key]: filterValue }));
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({});
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
    setPageSize(10);
  };

  const handleDownloadPDF = async () => {
    if (payments.length === 0) {
      alert("No payment data to download");
      return;
    }
    
    // Show confirmation dialog
    setWarningData({
      title: "Are you sure you want to download the finance report PDF?",
      description: "This will generate a PDF report with the current filtered payment data.",
      backButtonText: "Download",
      color: "yellow",
      function: async () => {
        try {
          await generatePaymentsPDF(payments, filters);
        } catch (error) {
          console.error("Error generating PDF:", error);
          alert("Failed to generate PDF. Please make sure all dependencies are installed: npm install jspdf jspdf-autotable");
        }
      },
    });
    setOpenWarningModal(true);
  };
  
  // Update filters when date changes
  useEffect(() => {
    const newFilters = { ...filters };
    if (startDate) {
      newFilters.startDate = format(startDate, "yyyy-MM-dd");
    } else {
      delete newFilters.startDate;
    }
    if (endDate) {
      newFilters.endDate = format(endDate, "yyyy-MM-dd");
    } else {
      delete newFilters.endDate;
    }
    setFilters(newFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  if (loading && payments.length === 0) {
    return <FinancesSkeleton />;
  }

  return (
    <div className="w-full px-4 py-2">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Finance Management</h1>
        <Button
          onClick={handleDownloadPDF}
          variant="outline"
          className="flex items-center gap-2"
          disabled={payments.length === 0 || loading}
        >
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      {/* Filter Toggle Button */}
      <Button
        variant="outline"
        onClick={() => setShowFilters(!showFilters)}
        className="mb-4 w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </span>
        {showFilters ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>

      {/* Filters Section */}
      {showFilters && (
        <Card className="p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search Term */}
            <div>
              <span className="text-sm font-medium mb-1 block">Search</span>
              <Input
                placeholder="Payment ID / Month / Name"
                value={filters.searchTerm || ""}
                onChange={(e) => handleFilterChange("searchTerm", e.target.value || undefined)}
                className="w-full"
              />
            </div>

            {/* Payment ID */}
            <div>
              <span className="text-sm font-medium mb-1 block">Payment ID</span>
              <Input
                placeholder="Enter Payment ID"
                value={filters.paymentId || ""}
                onChange={(e) => handleFilterChange("paymentId", e.target.value || undefined)}
                className="w-full"
              />
            </div>

            {/* Customer ID (Paid For) */}
            <div>
              <span className="text-sm font-medium mb-1 block">Customer ID (Paid For)</span>
              <Input
                placeholder="Enter Customer ID"
                value={filters.paidFor || ""}
                onChange={(e) => handleFilterChange("paidFor", e.target.value || undefined)}
                className="w-full"
              />
            </div>

            {/* Payer ID */}
            <div>
              <span className="text-sm font-medium mb-1 block">Payer ID (Paid By)</span>
              <Input
                placeholder="Enter Payer ID"
                value={filters.paidBy || ""}
                onChange={(e) => handleFilterChange("paidBy", e.target.value || undefined)}
                className="w-full"
              />
            </div>

            {/* Month */}
            <div>
              <span className="text-sm font-medium mb-1 block">Month</span>
              <Select
                value={filters.month ? filters.month : "all"}
                onValueChange={(value) => {
                  const filterValue = value === "all" ? undefined : value;
                  handleFilterChange("month", filterValue);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {MONTHS.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Min Amount */}
            <div>
              <span className="text-sm font-medium mb-1 block">Minimum Amount</span>
              <Input
                type="number"
                placeholder="Min Amount"
                value={filters.minAmount || ""}
                onChange={(e) => handleFilterChange("minAmount", e.target.value ? Number(e.target.value) : undefined)}
                className="w-full"
              />
            </div>

            {/* Max Amount */}
            <div>
              <span className="text-sm font-medium mb-1 block">Maximum Amount</span>
              <Input
                type="number"
                placeholder="Max Amount"
                value={filters.maxAmount || ""}
                onChange={(e) => handleFilterChange("maxAmount", e.target.value ? Number(e.target.value) : undefined)}
                className="w-full"
              />
            </div>

            {/* Start Date */}
            <div>
              <span className="text-sm font-medium mb-1 block">Start Date</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    {startDate ? format(startDate, "MM/dd/yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      // Ensure end date is not before start date
                      if (date && endDate && date > endDate) {
                        setEndDate(undefined);
                      }
                    }}
                    disabled={(date) => {
                      if (endDate && date > endDate) return true;
                      return date > new Date() || date < new Date("1900-01-01");
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div>
              <span className="text-sm font-medium mb-1 block">End Date</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    {endDate ? format(endDate, "MM/dd/yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      // Ensure start date is not after end date
                      if (date && startDate && date < startDate) {
                        setStartDate(undefined);
                      }
                    }}
                    disabled={(date) => {
                      if (startDate && date < startDate) return true;
                      return date > new Date() || date < new Date("1900-01-01");
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Access Given */}
            <div>
              <span className="text-sm font-medium mb-1 block">Access Given</span>
              <Select
                value={filters.accessgiven === undefined ? "all" : String(filters.accessgiven)}
                onValueChange={(value) => {
                  let filterValue: boolean | undefined;
                  if (value === "all") {
                    filterValue = undefined;
                  } else {
                    filterValue = value === "true";
                  }
                  handleFilterChange("accessgiven", filterValue);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Is Extra */}
            <div>
              <span className="text-sm font-medium mb-1 block">Extra Payment</span>
              <Select
                value={filters.isExtra === undefined ? "all" : String(filters.isExtra)}
                onValueChange={(value) => {
                  let filterValue: boolean | undefined;
                  if (value === "all") {
                    filterValue = undefined;
                  } else {
                    filterValue = value === "true";
                  }
                  handleFilterChange("isExtra", filterValue);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div>
              <span className="text-sm font-medium mb-1 block">Sort Order</span>
              <Select
                value={filters.sortOrder || "desc"}
                onValueChange={(value) => handleFilterChange("sortOrder", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="w-full"
            >
              Clear All Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Total Payments Amount Summary */}
      {payments.length > 0 && (
        <Card className="p-4 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Payments Amount</div>
              <div className="text-2xl font-bold text-gray-800">
                Rs. {payments.reduce((sum, payment) => sum + (payment.amount || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Based on {payments.length} payment{payments.length !== 1 ? 's' : ''} shown
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Payments List */}
      <Card className="p-4">
        {payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No payments found
          </div>
        ) : (
          <div className="space-y-2">
            {payments.map((payment) => (
              <div
                key={payment._id}
                className="border border-gray-200 bg-white pb-3 pt-3 px-4 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex mb-2">
                  <div className="flex-1">
                    <div className="text-[13px] text-[#6D6D6D]">Payment Date</div>
                    <div className="text-[13px] text-[#434745]">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] text-[#6D6D6D]">Payment ID</div>
                    <div className="text-[13px] text-[#434745]">
                      {payment.paymentId}
                    </div>
                  </div>
                </div>

                <div className="flex mb-2">
                  <div className="flex-1">
                    <div className="text-[13px] text-[#6D6D6D]">Customer (Paid For)</div>
                    <div className="text-[13px] text-[#434745]">
                      {payment.paidFor}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] text-[#6D6D6D]">Payer (Paid By)</div>
                    <div className="text-[13px] text-[#434745]">
                      {payment.paidBy}
                    </div>
                  </div>
                </div>

                <div className="flex mb-2">
                  <div className="flex-1">
                    <div className="text-[13px] text-[#6D6D6D]">Month</div>
                    <div className="text-[13px] text-[#434745]">
                      {payment.month}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] text-[#6D6D6D]">Reference</div>
                    <div className="text-[13px] text-[#434745]">
                      {payment.reference}
                    </div>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-1">
                    <div className="text-[13px] text-[#6D6D6D]">Amount</div>
                    <div className="text-[13px] text-[#434745] font-medium">
                      Rs. {payment.amount.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] text-[#6D6D6D]">Payment Type</div>
                    <div>
                      <Badge
                        className={`mt-1 ${
                          payment.isExtra
                            ? "bg-[#9DDCFF] text-[#30247D]"
                            : "bg-[#CDEDFF] text-[#005F95]"
                        } w-[103px] h-[25px] rounded-full text-[12px]`}
                      >
                        {payment.isExtra ? "Extra" : "Regular"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* <div className="mt-2 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`${
                        payment.accessgiven
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-700"
                      } text-[11px]`}
                    >
                      Access {payment.accessgiven ? "Granted" : "Pending"}
                    </Badge>
                    <Badge
                      className={`${
                        payment.status === "ACTIVE"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      } text-[11px]`}
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div> */}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pagination */}
      <div className="my-5">
        <div className="flex flex-col gap-4">
          {/* Page Size Selector - Always visible */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-[#3D3D3D]">Show per page:</span>
            <Input
              type="number"
              value={pageSize}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  return;
                }
                const newSize = Number(value);
                if (newSize > 0 && newSize <= 300) {
                  setPageSize(newSize);
                  setPage(1);
                } else if (newSize > 300) {
                  setPageSize(300);
                  setPage(1);
                }
              }}
              onBlur={(e) => {
                const value = e.target.value;
                if (value === "" || Number(value) <= 0) {
                  setPageSize(10);
                } else if (Number(value) > 300) {
                  setPageSize(300);
                }
              }}
              min="1"
              max="300"
              className="w-24 h-9"
              placeholder="10"
            />
          </div>

          {/* Page Navigation - Only show if there are results */}
          {totalCount > 0 && (
            <>
              <div className="text-[11px] text-[#3D3D3D] text-center">
                Showing {payments.length} of {totalCount} results
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="w-9 h-9"
                >
                  ←
                </Button>
                <span className="text-sm px-4">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                  className="w-9 h-9"
                >
                  →
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

