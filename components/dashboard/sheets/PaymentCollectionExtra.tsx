import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useExtraPaymentCollectionSheet } from "@/hooks/usePaymentCollectionExtra";
import { collectExtraPayment } from "@/actions/clientPayment";
import React, { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

// Validation schema
const paymentSchema = z.object({
  sessionQuota: z.number({
    required_error: "Session count is required",
    invalid_type_error: "Session count must be a number"
  }).int().positive("Session count must be positive"),
  amount: z.number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number"
  }).positive("Amount must be positive"),
});

interface PaymentCollectionExtraProps {
  clientId: string | null;
  onPaymentSuccess?: () => void;
}

export const PaymentCollectionExtra = ({ 
  clientId, 
  onPaymentSuccess 
}: PaymentCollectionExtraProps) => {
  const {
    openExtraPaymentCollectionSheet,
    setOpenExtraPaymentCollectionSheet,
  } = useExtraPaymentCollectionSheet();

  const [formData, setFormData] = useState({
    sessionQuota: 0, // Initialize as number
    amount: 0,       // Initialize as number
    clientId: clientId,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const numericValue = Number(value);
    
    // Only update if it's a valid number or empty (which we'll treat as 0)
    if (!isNaN(numericValue)) {
      setFormData(prev => ({ 
        ...prev, 
        [id]: value === "" ? 0 : numericValue 
      }));
    }
    
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!clientId) {
      toast.error("Client ID is missing. Cannot process payment.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Validate the numbers directly
      const validatedData = paymentSchema.parse({
        sessionQuota: formData.sessionQuota,
        amount: formData.amount
      });

      const result = await collectExtraPayment({ 
        ...validatedData, 
        paidFor: clientId 
      });
      
      if (result.status === "SUCCESS") {
        toast.success(`Extra payment of LKR ${validatedData.amount.toFixed(2)} collected`);
        setOpenExtraPaymentCollectionSheet(false);
        setFormData({ sessionQuota: 0, amount: 0, clientId: clientId });
        
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      } else {
        throw new Error(result.message || "Payment collection failed");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {} as Record<string, string>);
        setErrors(fieldErrors);
      } else {
        toast.error(error instanceof Error ? error.message : "Payment failed");
        console.error("Payment error:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to check if inputs contain valid positive numbers
  const isValidNumber = (value: number) => {
    return value > 0;
  };

  return (
    <Sheet
      open={openExtraPaymentCollectionSheet}
      onOpenChange={setOpenExtraPaymentCollectionSheet}
    >
      <SheetContent
        side="bottom"
        className="rounded-t-2xl min-h-120 max-h-[calc(100%-40px)]"
      >
        <SheetHeader className="gap-5">
          <SheetTitle className="text-[14px] font-semibold text-[#363636]">
            Extra Payment Collection
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col px-4 overflow-y-auto gap-[20px]">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="sessionQuota"
              className="text-[12px]/[100%] font-medium text-[#363636]"
            >
              Session count
            </Label>
            <Input
              placeholder="Enter Session count"
              type="number"
              min="1"
              step="1"
              id="sessionQuota"
              value={formData.sessionQuota || ""}
              onChange={handleInputChange}
              className="h-[53px] text-[14px]/[100%] font-semibold text-[#3D3D3D] placeholder:text-[#B0B0B0] placeholder:font-normal"
            />
            {errors.sessionQuota && (
              <p className="text-red-500 text-xs">{errors.sessionQuota}</p>
            )}
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="amount"
              className="text-[12px]/[100%] font-medium text-[#363636]"
            >
              Amount (LKR)
            </Label>
            <Input
              placeholder="Enter Amount"
              type="number"
              min="0.01"
              step="0.01"
              id="amount"
              value={formData.amount || ""}
              onChange={handleInputChange}
              className="h-[53px] text-[14px]/[100%] font-semibold text-[#3D3D3D] placeholder:text-[#B0B0B0] placeholder:font-normal"
            />
            {errors.amount && (
              <p className="text-red-500 text-xs">{errors.amount}</p>
            )}
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
            disabled={
              isSubmitting || 
              !isValidNumber(formData.sessionQuota) || 
              !isValidNumber(formData.amount)
            }
            className="bg-[#378644] rounded-[10px] text-[13px] font-semibold text-[#FFFFFF] h-[40px]"
          >
            {isSubmitting ? "Processing..." : "Collect"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};