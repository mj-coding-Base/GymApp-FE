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
import { useCollectPaymentSuccessGroupSheet } from "@/hooks/useCollectPaymentSuccessGroupSheet";
import { usePaymentCollectionGroupSheet } from "@/hooks/usePaymentCollectionGroupSheet";
import { collectGroupPayment } from "@/actions/clientPayment";
import React, { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

// Validation schema
const paymentSchema = z.object({
  collectedFrom: z.string().min(1, "Collected from is required"),
  amount: z.number().positive("Amount must be positive"),
});

const PaymentCollectionGroup = (groupId: string) => {
  const {
    openPaymentCollectionGroupSheet,
    setOpenPaymentCollectionGroupSheet,
  } = usePaymentCollectionGroupSheet();

  const { setOpenCollectPaymentSuccessGroupSheet } =
    useCollectPaymentSuccessGroupSheet();

  const [formData, setFormData] = useState({
    collectedFrom: "",
    amount: "",
    groupId: groupId, // Assuming you need to pass groupId in the payment data
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
        collectedFrom: formData.collectedFrom,
        amount: Number(formData.amount)
      });

      // Submit payment
      const result = await collectGroupPayment(validatedData);
      
      if (result.status === "SUCCESS") {
        toast.success(`Payment of LKR ${validatedData.amount.toFixed(2)} collected successfully`);
        setOpenPaymentCollectionGroupSheet(false);
        setOpenCollectPaymentSuccessGroupSheet(true);
        setFormData({ collectedFrom: "", amount: "", groupId: groupId }); // Reset form data
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
      open={openPaymentCollectionGroupSheet}
      onOpenChange={setOpenPaymentCollectionGroupSheet}
    >
      <SheetContent
        side="bottom"
        className="rounded-t-2xl min-h-120 max-h-[calc(100%-40px)]"
      >
        <SheetHeader className="gap-5">
          <SheetTitle className="text-[14px] font-semibold text-[#363636]">
            Collect Group Payment
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col px-4 overflow-y-auto gap-[20px]">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="collectedFrom"
              className="text-[12px]/[100%] font-medium text-[#363636]"
            >
              Collected From
            </Label>
            <Input
              placeholder="Collected From"
              type="text"
              id="collectedFrom"
              value={formData.collectedFrom}
              onChange={handleInputChange}
              className="h-[53px] text-[14px]/[100%] font-semibold text-[#3D3D3D] placeholder:text-[#B0B0B0] placeholder:font-normal"
            />
            {errors.collectedFrom && (
              <p className="text-red-500 text-xs">{errors.collectedFrom}</p>
            )}
          </div>
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
            disabled={isSubmitting || !formData.collectedFrom || !formData.amount}
            className="bg-[#378644] rounded-[10px] text-[13px] font-semibold text-[#FFFFFF] h-[40px]"
          >
            {isSubmitting ? "Processing..." : "Collect"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default PaymentCollectionGroup;