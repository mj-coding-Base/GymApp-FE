"use client";

import { fetchIndividualCustomers } from "@/actions/customers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { IndividualCustomer } from "@/types/Customer";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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

  const handleToggleCustomer = (customer: IndividualCustomer) => {
    if (selectedCustomers.length >= 10 && !selectedCustomers.some(c => c._id === customer._id)) {
      alert("Maximum 10 customers allowed");
      return;
    }
    
    setSelectedCustomers(prev => {
      const exists = prev.some(c => c._id === customer._id);
      if (exists) {
        return prev.filter(c => c._id !== customer._id);
      }
      return [...prev, customer];
    });
  };

  const handleRemoveCustomer = (customerId: string) => {
    setSelectedCustomers(prev => prev.filter(c => c._id !== customerId));
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (selectedCustomers.length === 0) {
      alert("Please select at least one customer");
      return;
    }

    // Log the API request
    const apiRequest = {
      package: data.package,
      members: selectedCustomers.map((customer, index) => ({
        customerId: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        mobileNumber: customer.mobileNumber,
        email: customer.email,
        nic: customer.nic,
        isPrimaryMember: index === 0,
        packageId: customer.packageId,
      })),
    };

    console.log("API Request:", JSON.stringify(apiRequest, null, 2));

      setSuccessData({
        title: `Registration Successful!`,
        description: `The group has been successfully registered!`,
        backButtonText: "Done",
        function: () => {},
      });
      setOpenAddNewGroup(false);
      setOpenSuccessModal(true);
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
                      <FormItem className="flex flex-col gap-[4px]">
                        <FormLabel className="font-normal text-[14px]/[17px]">
                          Package *
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]">
                              <SelectValue placeholder="Select Package" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="boxfitExtreme">
                              Boxfit Extreme
                            </SelectItem>
                            <SelectItem value="boxfitInHealthy">
                              BoxFit In Healthy
                            </SelectItem>
                            <SelectItem value="boxfitBoxer">
                              BoxFit Boxer
                            </SelectItem>
                            <SelectItem value="boxfitCasual">
                              BoxFit Casual
                            </SelectItem>
                            <SelectItem value="boxfitOnline">
                              BoxFit Online
                            </SelectItem>
                          </SelectContent>
                        </Select>
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
                        {availableCustomers.map((customer) => (
                          <button
                            key={customer._id}
                            type="button"
                            onClick={() => handleToggleCustomer(customer)}
                            className={`w-full p-3 rounded-lg border text-left ${
                              selectedCustomers.some(c => c._id === customer._id)
                                ? 'border-[#378644] bg-green-50'
                                : 'border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={selectedCustomers.some(c => c._id === customer._id)}
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
                          </button>
                        ))}
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
