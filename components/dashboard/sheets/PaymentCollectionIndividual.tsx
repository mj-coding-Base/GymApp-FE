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
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { submitPaymentReal } from "@/actions/clientPayment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Payment validation schema
const paymentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  reference: z.string().optional(),
  month: z.string().min(1, "Month is required"),
});

const PaymentCollectionIndividual = ({ clientId }: { clientId: string | null }) => {
  const {
    openPaymentCollectionIndividualSheet,
    setOpenPaymentCollectionIndividualSheet,
  } = usePaymentCollectionIndividualSheet();

  const [formData, setFormData] = useState({
    amount: "",
    reference: "",
    month: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [monthOptions, setMonthOptions] = useState<{value: string, label: string}[]>([]);

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

  const handleSubmit = async () => {
    if (!clientId) {
      toast.error("Client ID is missing. Cannot process payment.");
      return;
    }
    try {
      setIsSubmitting(true);
      
      // Validate input
      const validatedData = paymentSchema.parse({
        amount: Number(formData.amount),
        reference: formData.reference || "cash" ,
        month: formData.month,
      });
      const paidFor = clientId;
      await submitPaymentReal({ ...validatedData, paidFor });
      
      toast.success(`Payment of LKR ${validatedData.amount.toFixed(2)} collected successfully for ${monthOptions.find(m => m.value === validatedData.month)?.label}`);
      setOpenPaymentCollectionIndividualSheet(false);
      setFormData({ amount: "", reference: "", month: monthOptions[1].value }); // Reset to current month
      
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
                  <SelectItem key={month.value} value={month.label}>
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
            disabled={isSubmitting || !formData.amount || !formData.month}
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