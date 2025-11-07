"use client";

import { fetchIndividualCustomers } from "@/actions/customers";
import { fetchAllPackages } from "@/actions/package";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useSuccessModal } from "@/hooks/modals/useSuccessModal";
import { useDebounce } from "@/hooks/useDebounce";
import { useViewGroupDetails } from "@/hooks/useGroupDetailsSheet";
import { cn } from "@/lib/utils";
import { CommonResponseDataType } from "@/types/Common";
import { IndividualCustomer } from "@/types/Customer";
import type { Package } from "@/types/Packages";
import axios from "@/utils/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  package: z
    .string({
      required_error: "Please select a package",
    })
    .min(1, "Please select a package"),
});

function AddNewGroup() {
  const { openAddNewGroup, setOpenAddNewGroup } = useViewGroupDetails();
  const { setOpenSuccessModal, setSuccessData } = useSuccessModal();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // State for user search
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [availableCustomers, setAvailableCustomers] = useState<IndividualCustomer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<IndividualCustomer[]>([]);
  // Packages
  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  
  // Track which step we're on
  const [currentStep, setCurrentStep] = useState<"package" | "select">("package");

  // Fetch customers when entering select step
  useEffect(() => {
    const fetchCustomers = async () => {
      if (currentStep === "select") {
        try {
          setLoadingCustomers(true);
          const response = await fetchIndividualCustomers(
            "1",
            "100",
            debouncedSearchTerm || undefined
          );
          setAvailableCustomers(response?.results || []);
        } catch (err) {
          console.error("Error fetching customers:", err);
        } finally {
          setLoadingCustomers(false);
        }
      }
    };

    fetchCustomers();
  }, [debouncedSearchTerm, currentStep]);

  // Fetch packages when sheet opens (package step)
  useEffect(() => {
    const loadPackages = async () => {
      try {
        setLoadingPackages(true);
        // Fetch packages from server
        const fetchedPackages = await fetchAllPackages();
        console.log("Fetched packages:", fetchedPackages);
        if (!fetchedPackages || fetchedPackages.length === 0) {
          console.warn("No packages returned from API");
          setPackages([]);
          return;
        }
        const activePackages = fetchedPackages.filter(p => p.isActive !== false);
        console.log("Active packages count:", activePackages.length, activePackages);
        setPackages(activePackages);
      } catch (err) {
        console.error("Failed to load packages", err);
        toast.error("Failed to load packages");
        setPackages([]);
      } finally {
        setLoadingPackages(false);
      }
    };

    if (openAddNewGroup && currentStep === "package") {
      loadPackages();
    }
  }, [openAddNewGroup, currentStep]);

  const handleToggleCustomer = (customer: IndividualCustomer) => {
    setSelectedCustomers(prev => {
      const exists = prev.some(c => c._id === customer._id);
      if (exists) {
        // Customer is selected, remove them
        return prev.filter(c => c._id !== customer._id);
      }
      // Customer is not selected, add them if under limit
      if (prev.length >= 10) {
        alert("Maximum 10 customers allowed");
        return prev; // Return unchanged state
      }
      return [...prev, customer];
    });
  };

  const handleRemoveCustomer = (customerId: string) => {
    setSelectedCustomers(prev => prev.filter(c => c._id !== customerId));
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!data.package) {
      toast.error("Please select a package");
      return;
    }
    if (selectedCustomers.length === 0) {
      toast.error("Please select at least one customer");
      return;
    }

    // Build request compatible with backend
    const customerIds = selectedCustomers.map((c) => c.clientId);
    const relatioship = selectedCustomers.map((_, idx) => (idx === 0 ? "primary" : "member"));
    const requestBody = {
      customerIds,
      relatioship, // note: spelled as provided by backend
      packageId: data.package,
    };

    // Gather auth headers (fallback if interceptor/token missing)
    const hasWindow = typeof globalThis !== 'undefined' && (globalThis as { window?: unknown }).window !== undefined;
    let token = hasWindow ? localStorage.getItem("x-auth-token") : null;
    let gymId = hasWindow ? localStorage.getItem("gym-id") : null;

    // Fallback: read from user-details cookie
    if (hasWindow && (!token || !gymId)) {
      try {
        const cookieStr = document.cookie || '';
        const userCookie = cookieStr
          .split('; ')
          .find(row => row.startsWith('user-details='))
          ?.split('=')[1];
        if (userCookie) {
          const decoded = decodeURIComponent(userCookie);
          const parsed = JSON.parse(decoded);
          token = token || parsed?.token || null;
          gymId = gymId || parsed?.gymId || null;
          // Prime localStorage for subsequent requests
          if (token) localStorage.setItem('x-auth-token', token);
          if (gymId) localStorage.setItem('gym-id', gymId);
        }
      } catch (e) {
        console.error('Failed to read auth from cookies', e);
      }
    }

    if (!token) {
      console.error("Missing authentication token in localStorage");
      toast.error("You are not authenticated. Please log in again.");
      return;
    }
    if (!gymId) {
      console.warn("Missing gym-id in localStorage");
      toast.error("Gym not selected. Please refresh and try again.");
      return;
    }

    // Log the exact request being sent (with header summary only)
    console.log(
      "CreateGroup request:",
      JSON.stringify(requestBody, null, 2),
      "\nHeaders:",
      { "x-auth-token": token ? "<present>" : "<missing>", "gym-id": gymId }
    );

    try {
      const res = await axios.post(
        "/api/groups/createGroup",
        requestBody,
        { headers: { "x-auth-token": token, "gym-id": gymId } }
      );

      const responseData = res.data as CommonResponseDataType;
      if (responseData?.status === "FAIL") {
        toast.error(responseData?.message || "Failed to create group");
        return;
      }

      setSuccessData({
        title: `Registration Successful!`,
        description: `The group has been successfully registered!`,
        backButtonText: "Done",
        function: () => {},
      });
      setOpenAddNewGroup(false);
      setOpenSuccessModal(true);
    } catch (err) {
      console.error("CreateGroup error:", err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error?.response?.data?.message || error?.message || "Failed to create group");
    }
  };

  const selectedPackage = form.watch("package");

  return (
    <div className="">
      <Sheet open={openAddNewGroup} onOpenChange={setOpenAddNewGroup}>
        <SheetContent
          side="bottom"
          hideClose={true}
          className="overflow-y-auto rounded-t-2xl min-h-[600px] max-h-[calc(100%-40px)] px-[16px] pt-[16px] pb-[30px] gap-5"
        >
          <SheetHeader className="hidden">
            <SheetTitle></SheetTitle>
          </SheetHeader>

          <h1 className="text-[16px]/[19px] font-medium text-[#212121] text-center">
            New User Group Registration
          </h1>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col h-full gap-[15px]"
              >
              {/* Step 1: Package Selection */}
              {currentStep === "package" && (
                <div className="flex flex-col gap-[15px]">
                  <FormField
                    control={form.control}
                    name="package"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-[8px]">
                        <FormLabel className="font-normal text-[14px]/[17px]">
                          Package *
                        </FormLabel>

                        {loadingPackages ? (
                          <div className="grid grid-cols-2 gap-3">
                            <Skeleton className="h-[90px] rounded-lg" />
                            <Skeleton className="h-[90px] rounded-lg" />
                            <Skeleton className="h-[90px] rounded-lg" />
                            <Skeleton className="h-[90px] rounded-lg" />
                          </div>
                        ) : (
                          packages.length === 0 ? (
                            <p className="text-[12px] text-[#6D6D6D]">No packages available</p>
                          ) : (
                          <div className="grid grid-cols-2 gap-3">
                            {packages.map((pkg) => {
                              const isSelected = field.value === pkg.packageId;
                              return (
                                <button
                                  key={pkg.packageId}
                                  type="button"
                                  onClick={() => field.onChange(pkg.packageId)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      field.onChange(pkg.packageId);
                                    }
                                  }}
                                  className={cn(
                                    "p-4 rounded-[10px] border-2 text-left transition-all w-full",
                                    isSelected
                                      ? "border-[#378644] bg-[#378644]/10"
                                      : "border-[#E0E0E0] bg-white hover:border-[#378644]/50"
                                  )}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h3 className="text-[14px] font-semibold text-[#363636] mb-1 truncate">
                                        {pkg.package_name}
                                      </h3>
                                      <div className="flex items-center gap-4 text-[12px] text-[#6D6D6D]">
                                        <span>{pkg.durationDays} days</span>
                                        <span className="text-[14px] font-bold text-[#378644]">
                                          LKR {pkg.price.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <div className="ml-2">
                                        <div className="w-5 h-5 rounded-full bg-[#378644] flex items-center justify-center">
                                          <svg
                                            className="w-3 h-3 text-white"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path d="M5 13l4 4L19 7"></path>
                                          </svg>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                          )
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    onClick={() => selectedPackage && setCurrentStep("select")}
                    disabled={!selectedPackage}
                    className="bg-[#378644] rounded-[10px] text-[13px] font-semibold text-[#FFFFFF] h-[40px]"
                  >
                    Next: Select Customers
                  </Button>
                </div>
              )}

              {/* Step 2: Customer Selection */}
              {currentStep === "select" && (
                <div className="flex flex-col h-full gap-[15px]">
                  <div className="flex flex-col gap-[10px]">
                    <p className="text-[14px]/[17px] font-medium">
                      Search and Select Customers (Max 10)
                    </p>
                    <div className="relative w-full h-[40px]">
                      <i className="search-icon w-[16.54px] h-[18.9px] text-[#6D6D6D] absolute left-3 top-1/2 -translate-y-1/2" />
                              <Input
                        type="search"
                        placeholder="Search by Name / NIC"
                        className="pl-10 text-[11px] font-normal text-[#4F4F4F] h-[40px] border-[0.9px] border-[#6D6D6D]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                              />
                            </div>
                          </div>

                  {/* Available Customers List */}
                  <div className="flex-1 overflow-y-auto border-[0.9px] border-[#5D5D5D] rounded-[9px] p-3">
                    {loadingCustomers && (
                      <div className="space-y-2">
                        <Skeleton className="h-16 w-full rounded-lg" />
                        <Skeleton className="h-16 w-full rounded-lg" />
                        <Skeleton className="h-16 w-full rounded-lg" />
                        <Skeleton className="h-16 w-full rounded-lg" />
                        <Skeleton className="h-16 w-full rounded-lg" />
                            </div>
                    )}
                    {!loadingCustomers && availableCustomers.length === 0 && (
                      <div className="text-center text-gray-500 py-4">
                        {searchTerm ? "No customers found" : "Type to search for customers"}
                            </div>
                    )}
                    {!loadingCustomers && availableCustomers.length > 0 && (
                      <div className="space-y-2">
                        {availableCustomers.map((customer) => {
                          const isSelected = selectedCustomers.some(c => c._id === customer._id);
                          
                          return (
                            <label
                              key={customer._id}
                              htmlFor={`customer-${customer._id}`}
                              className={`w-full p-3 rounded-lg border text-left cursor-pointer transition-colors block ${
                                isSelected
                                  ? 'border-[#378644] bg-green-50'
                                  : 'border-transparent hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  id={`customer-${customer._id}`}
                                  checked={isSelected}
                                  onCheckedChange={() => handleToggleCustomer(customer)}
                                />
                                <div className="flex-1">
                                  <p className="text-[13px] font-medium text-[#363636]">
                                    {customer.firstName} {customer.lastName}
                                  </p>
                                  <p className="text-[11px] text-[#6D6D6D]">
                                    NIC: {customer.nic || 'N/A'} • {customer.mobileNumber}
                                  </p>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                          </div>

                  {/* Selected Customers Preview */}
                  {selectedCustomers.length > 0 && (
                    <div className="border-[0.9px] border-[#378644] rounded-[9px] p-3 bg-green-50">
                      <p className="text-[12px] font-medium mb-2 text-[#378644]">
                        Selected Customers ({selectedCustomers.length}/10)
                      </p>
                      <div className="space-y-2 max-h-[150px] overflow-y-auto">
                        {selectedCustomers.map((customer, index) => {
                          const isPrimaryMember = index === 0;
                          return (
                          <Card
                            key={customer._id}
                            className={`p-2 ${
                              isPrimaryMember ? 'bg-yellow-100 border-yellow-400' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1">
                                {index === 0 && (
                                  <UserCheck className="w-4 h-4 text-yellow-600" />
                                )}
                                <div>
                                  <p className="text-[12px] font-medium">
                                    {index === 0 && "🏆 Primary: "}
                                    {customer.firstName} {customer.lastName}
                                  </p>
                                  <p className="text-[10px] text-gray-600">
                                    {customer.email}
                                  </p>
                            </div>
                          </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveCustomer(customer._id)}
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                                </div>
                          </Card>
                          );
                        })}
                            </div>
                          </div>
                  )}

                  {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-[15px]">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep("package")}
                      className="border-[#69716C] rounded-[10px] text-[13px] font-semibold text-[#69716C] h-[40px]"
                    >
                      Back
                    </Button>
                  <Button
                      disabled={form.formState.isSubmitting || selectedCustomers.length === 0}
                    type="submit"
                      className="bg-[#378644] rounded-[10px] text-[13px] font-semibold text-[#FFFFFF] h-[40px]"
                  >
                    {form.formState.isSubmitting ? (
                      <Loader2 className="size-6 animate-spin" />
                    ) : (
                        "Create Group"
                    )}
                  </Button>
                </div>
                </div>
              )}
              </form>
            </Form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default AddNewGroup;
