"use client";

import { collectIndividualPayment } from "@/actions/clientPayment";
import { updateCustomer } from "@/actions/customers";
import { fetchAllPackages } from "@/actions/package";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useSuccessModal } from "@/hooks/modals/useSuccessModal";
import { usePaymentCollectionIndividualSheet } from "@/hooks/usePaymentCollectionIndividualSheet";
import { cn } from "@/lib/utils";
import { Package } from "@/types/Packages";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

// Payment validation schema
const paymentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  reference: z.string().optional(),
  month: z.string().min(1, "Month is required"),
});
interface PaymentCollectionIndividualProps {
  clientId: string | null;
  onPaymentSuccess?: () => void; // Add this prop
}

const PaymentCollectionIndividual = ({ 
  clientId, 
  onPaymentSuccess 
}: PaymentCollectionIndividualProps) => {

  const {
    openPaymentCollectionIndividualSheet,
    setOpenPaymentCollectionIndividualSheet,
  } = usePaymentCollectionIndividualSheet();

  const [formData, setFormData] = useState({
    amount: "",
    reference: "",
    month: "",
    packageId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [monthOptions, setMonthOptions] = useState<{value: string, label: string}[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  
  const { setOpenSuccessModal, setSuccessData } = useSuccessModal();
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Generate month options when component mounts
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const months = [
      { value: `${currentYear}-${currentMonth}`, label: new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' }) },
      { value: `${currentYear}-${currentMonth + 1}`, label: new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' }) },
      { value: `${currentYear}-${currentMonth + 2}`, label: new Date(currentYear, currentMonth + 1).toLocaleString('default', { month: 'long' }) },
    ];

    setMonthOptions(months);
    // Set default to current month
    setFormData(prev => ({ ...prev, month: `${currentYear}-${currentMonth + 1}` }));
  }, []);

  useEffect(() => {
    // Fetch packages when sheet opens
    const loadPackages = async () => {
      if (!openPaymentCollectionIndividualSheet) return;
      
      setLoadingPackages(true);
      setPackages([]); // Clear previous packages
      
      try {
        // Fetch packages from server
        const fetchedPackages = await fetchAllPackages();
        console.log("Fetched packages:", fetchedPackages);
        
        if (!fetchedPackages || fetchedPackages.length === 0) {
          console.warn("No packages returned from API");
          setPackages([]);
          return;
        }
        
        // Filter only active packages (default to true if undefined)
        const activePackages = fetchedPackages.filter(pkg => pkg.isActive !== false);
        console.log("Active packages count:", activePackages.length, activePackages);
        
        if (activePackages.length === 0) {
          console.warn("No active packages found");
        }
        
        setPackages(activePackages);
      } catch (error) {
        console.error("Failed to fetch packages:", error);
        toast.error("Failed to load packages");
        setPackages([]);
      } finally {
        setLoadingPackages(false);
      }
    };

    loadPackages();
  }, [openPaymentCollectionIndividualSheet]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: "" }));
    }
  };

  const handleMonthChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      month: value
    }));
  };

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    setFormData(prev => ({
      ...prev,
      packageId: pkg.packageId,
      amount: pkg.price.toString(),
    }));
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!clientId) {
      toast.error("Client ID is missing. Cannot process payment.");
      return;
    }

    if (!selectedPackage) {
      toast.error("Please select a package");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Validate input
      const validatedData = paymentSchema.parse({
        amount: selectedPackage.price,
        reference: formData.reference || "cash",
        month: formData.month,
      });

      // Update customer's package first
      const updateResult = await updateCustomer(clientId, {
        packageId: selectedPackage.packageId,
      });

      if (updateResult.status === "FAIL") {
        toast.error(`Failed to update package: ${updateResult.message}`);
        setIsSubmitting(false);
        return;
      }

      // If customer update succeeds, collect payment immediately
      const paidFor = clientId;
      await collectIndividualPayment({ ...validatedData, paidFor });
      
      setIsSubmitting(false);
      
      // Close the payment sheet
      setOpenPaymentCollectionIndividualSheet(false);
      setFormData({ amount: "", reference: "", month: monthOptions[1].value, packageId: "" });
      setSelectedPackage(null);
      
      // Show success modal immediately after payment
      const handleModalClose = () => {
        if (autoCloseTimeoutRef.current) {
          clearTimeout(autoCloseTimeoutRef.current);
          autoCloseTimeoutRef.current = null;
        }
        setOpenSuccessModal(false);
        setSuccessData({
          title: "",
          description: "",
          backButtonText: "",
          function: () => {},
        });
      };

      setSuccessData({
        title: "Payment Collected Successfully!",
        description: `LKR ${validatedData.amount.toFixed(2)} has been collected successfully for ${formData.month}. Package has been updated.`,
        backButtonText: "Close",
        function: handleModalClose,
      });
      setOpenSuccessModal(true);

      // Auto-close modal after 5 seconds
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
      autoCloseTimeoutRef.current = setTimeout(() => {
        handleModalClose();
      }, 5000);
      
      // Call the success callback if provided
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {} as Record<string, string>);
        setErrors(fieldErrors);
      } else {
        toast.error("Failed to process payment. Please try again.");
        console.error("Payment error:", error);
      }
      setIsSubmitting(false);
    }
  };

  const handleSheetClose = (open: boolean) => {
    setOpenPaymentCollectionIndividualSheet(open);
    if (!open) {
      // Reset form when sheet closes
      setFormData({ amount: "", reference: "", month: monthOptions[1]?.value || "", packageId: "" });
      setSelectedPackage(null);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Sheet
      open={openPaymentCollectionIndividualSheet}
      onOpenChange={handleSheetClose}
    >
      <SheetContent
        side="bottom"
        className="rounded-t-2xl min-h-120 max-h-[calc(100%-40px)]"
      >
        <SheetHeader className="gap-5">
          <SheetTitle className="text-[14px] font-semibold text-[#363636]">
            Payment Collection
          </SheetTitle>
        </SheetHeader>
        <div className="px-4 overflow-y-auto space-y-4 py-4">
          {/* Package Selection Section */}
          <div className="grid w-full items-center gap-1.5">
            <Label className="text-[12px]/[100%] font-medium text-[#363636]">
              Select Package
            </Label>
            {(() => {
              if (loadingPackages) {
                return (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#363636]"></div>
                  </div>
                );
              }
              
              if (packages.length === 0) {
                return (
                  <p className="text-center py-4 text-sm text-gray-500">No packages available</p>
                );
              }
              
              return (
                <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto">
                  {packages.map((pkg) => {
                    const isSelected = selectedPackage?.packageId === pkg.packageId;
                    return (
                      <button
                        key={pkg.packageId || `pkg-${pkg.package_name}`}
                        type="button"
                        onClick={() => handlePackageSelect(pkg)}
                        className={cn(
                          "p-4 rounded-[10px] border-2 text-left transition-all w-full",
                          isSelected
                            ? "border-[#378644] bg-[#378644]/10"
                            : "border-[#E0E0E0] bg-white hover:border-[#378644]/50"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-[14px] font-semibold text-[#363636] mb-1">
                              {pkg.package_name || "Unnamed Package"}
                            </h3>
                            <div className="flex items-center gap-4 text-[12px] text-[#6D6D6D]">
                              <span>{pkg.durationDays || 0} days</span>
                              <span className="text-[14px] font-bold text-[#378644]">
                                LKR {pkg.price?.toFixed(2) || "0.00"}
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
              );
            })()}
            {errors.amount && (
              <p className="text-red-500 text-xs">{errors.amount}</p>
            )}
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label className="text-[12px]/[100%] font-medium text-[#363636]">
              Select Month
            </Label>
            <Select
              value={formData.month}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="h-[53px] text-[14px]/[100%] font-semibold text-[#3D3D3D]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.month && (
              <p className="text-red-500 text-xs">{errors.month}</p>
            )}
          </div>
          
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="reference"
              className="text-[12px]/[100%] font-medium text-[#363636]"
            >
              Reference (Optional)
            </Label>
            <Input
              placeholder="Payment reference"
              type="text"
              id="reference"
              value={formData.reference}
              onChange={handleInputChange}
              className="h-[53px] text-[14px]/[100%] font-semibold text-[#3D3D3D] placeholder:text-[#B0B0B0] placeholder:font-normal"
            />
          </div>
        </div>
        <SheetFooter className="grid grid-cols-2 gap-[15px]">
          <SheetClose asChild className="flex">
            <Button
              variant={"outline"}
              className="border-[#69716C] rounded-[10px] text-[13px] font-semibold text-[#69716C] h-[40px]"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </SheetClose>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedPackage || !formData.month}
            className="bg-[#378644] rounded-[10px] text-[13px] font-semibold text-[#FFFFFF] h-[40px]"
          >
            {isSubmitting ? "Processing..." : "Collect"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default PaymentCollectionIndividual;