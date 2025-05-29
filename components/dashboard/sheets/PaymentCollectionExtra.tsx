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
  session: z.string().min(1, "Session is required"),
  amount: z.number().positive("Amount must be positive"),
});

export const PaymentCollectionExtra = (clientId: string) => {
  const {
    openExtraPaymentCollectionSheet,
    setOpenExtraPaymentCollectionSheet,
  } = useExtraPaymentCollectionSheet();

  const [formData, setFormData] = useState({
    session: "",
    amount: "",
    clientId: clientId, // Assuming you need to pass clientId in the payment data
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: "" }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate form data
      const validatedData = paymentSchema.parse({
        session: formData.session,
        amount: Number(formData.amount)
      });

      // Submit payment
      const result = await collectExtraPayment(validatedData);
      
      if (result.status === "SUCCESS") {
        toast.success(`Extra payment of LKR ${validatedData.amount.toFixed(2)} collected`);
        setOpenExtraPaymentCollectionSheet(false);
        setFormData({ session: "", amount: "", clientId: clientId }); // Reset form data
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
              htmlFor="session"
              className="text-[12px]/[100%] font-medium text-[#363636]"
            >
              Session
            </Label>
            <Input
              placeholder="Enter Session"
              type="text"
              id="session"
              value={formData.session}
              onChange={handleInputChange}
              className="h-[53px] text-[14px]/[100%] font-semibold text-[#3D3D3D] placeholder:text-[#B0B0B0] placeholder:font-normal"
            />
            {errors.session && (
              <p className="text-red-500 text-xs">{errors.session}</p>
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
              id="amount"
              value={formData.amount}
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
            disabled={isSubmitting || !formData.session || !formData.amount}
            className="bg-[#378644] rounded-[10px] text-[13px] font-semibold text-[#FFFFFF] h-[40px]"
          >
            {isSubmitting ? "Processing..." : "Collect"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

