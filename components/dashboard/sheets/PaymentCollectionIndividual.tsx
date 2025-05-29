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
import { usePaymentCollectionIndividualSheet } from "@/hooks/usePaymentCollectionIndividualSheet";
import React, { useState } from "react";
import { toast } from "sonner"; // or your preferred toast library
import { z } from "zod";
import { submitPaymentReal } from "@/actions/clientPayment"; // Adjust the import based on your project structure

// Payment validation schema
const paymentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  reference: z.string().optional(),
});

const PaymentCollectionIndividual = (clientId: string) => {
  const {
    openPaymentCollectionIndividualSheet,
    setOpenPaymentCollectionIndividualSheet,
  } = usePaymentCollectionIndividualSheet();

  const [formData, setFormData] = useState({
    amount: "",
    reference: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error when user types
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: "" }));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate input
      const validatedData = paymentSchema.parse({
        amount: Number(formData.amount),
        reference: formData.reference,
        clientId:clientId
      });

      // Simulate API call with dummy data
      await submitPaymentReal({ ...validatedData, clientId });
      
      toast.success(`Payment of LKR ${validatedData.amount.toFixed(2)} collected successfully`);
      setOpenPaymentCollectionIndividualSheet(false);
      setFormData({ amount: "", reference: "" });
      
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
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dummy payment submission function


  return (
    <Sheet
      open={openPaymentCollectionIndividualSheet}
      onOpenChange={setOpenPaymentCollectionIndividualSheet}
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
        <div className="px-4 overflow-y-auto space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="amount"
              className="text-[12px]/[100%] font-medium text-[#363636]"
            >
              Enter Amount (LKR)
            </Label>
            <Input
              placeholder="Enter Amount"
              type="number"
              id="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="h-[53px] text-[14px]/[100%] font-semibold text-[#3D3D3D] placeholder:text-[#B0B0B0] placeholder:font-normal"
            />
            {errors.amount && (
              <p className="text-red-500 text-xs">{errors.amount}</p>
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
            disabled={isSubmitting || !formData.amount}
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