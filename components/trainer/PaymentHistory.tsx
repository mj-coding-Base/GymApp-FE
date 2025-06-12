"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CalendarForm } from "../common/CalendarForm";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2 } from "lucide-react";
import { Type } from "@/types/TrainerDetails";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getTrainerPayments, settlePayment, settlementSchema } from "@/actions/trainers";
import { toast } from "sonner";
import { z } from "zod";

interface Payment {
  id: string;
  registeredDate: string;
  sessionCount: string;
  month: string;
  salaryAmount: string;
  status: "paid" | "unpaid";
}

interface PaymentHistoryProps {
  trainerType?: Type;
  trainerId: string;
}

export function PaymentHistory({ trainerType, trainerId }: Readonly<PaymentHistoryProps>) {
  const [open, setOpen] = useState(false);
  const [showSettlementDialog, setShowSettlementDialog] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentData, setPaymentData] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof settlementSchema>>({
    resolver: zodResolver(settlementSchema),
    defaultValues: {
      name: "",
      nic: "",
      amount: "",
    },
  });

  useEffect(() => {
    if (open) {
      fetchPayments();
    }
  }, [open]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const data = await getTrainerPayments(trainerId);
      setPaymentData(data);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      toast.error("Failed to load payment history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettlePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    form.reset({
      name: "",
      nic: "",
      amount: payment.salaryAmount,
    });
    setShowSettlementDialog(true);
  };

  const onSubmit = async (data: z.infer<typeof settlementSchema>) => {
    try {
      if (!selectedPayment) return;
      
      const result = await settlePayment(selectedPayment.id, data);
      if (result.status === "SUCCESS") {
        setShowSettlementDialog(false);
        setShowConfirmationDialog(true);
        fetchPayments(); // Refresh payment data
      } else {
        toast.error(result.message ?? "Payment settlement failed");
      }
    } catch (error) {
      console.error("Error settling payment:", error);
      toast.error("An unexpected error occurred");
    }
  };

  // Part-time trainer payment history content
  const renderPartTimeContent = () => (
    <div className="mx-auto w-full max-w-md">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="rounded-[9px] border-[1px] mt-2">
          {paymentData.map((payment) => (
            <div key={payment.id} className="p-4 bg-white border-b last:border-b-0">
              <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[11px] text-[#6D6D6D]">Registered Date</p>
                <p className="text-[12px] text-[#434745]">
                  {payment.registeredDate}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#6D6D6D]">Session Count</p>
                <p className="text-[12px] text-[#434745]">
                  {payment.sessionCount}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#6D6D6D]">Month</p>
                <p className="text-[12px] text-[#434745]">{payment.month}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#6D6D6D]">Salary Amount</p>
                <p className="text-[12px] text-[#434745]">
                  {payment.salaryAmount}
                </p>
              </div>
              <div className="col">
                <p className="text-[11px] text-[#6D6D6D]">Payment Status</p>
                {payment.status === "unpaid" ? (
                  <Badge
                    onClick={() => handleSettlePayment(payment)}
                    className="rounded-[15px] bg-[#D32F2F] text-white text-[11px] cursor-pointer w-[101px] h-[19px]"
                  >
                    Settle Payment
                  </Badge>
                ) : (
                  <div className="bg-[#4CAF50]  text-white text-center justify-center flex items-center rounded-[15px] text-[11px] w-[43px] h-[19px] ">
                    Paid
                  </div>
                )}
              </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFullTimeContent = () => (
    <div className="mx-auto w-full max-w-md">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="rounded-[9px] border-[1px] mt-2">
          {paymentData.map((payment ) => (
            <div key={payment.id} className="p-4 bg-white border-b last:border-b-0">
            <div className="flex gap-8">
              <div className="flex-col-1">
                <p className="text-[11px] text-[#6D6D6D]">Registered Date</p>
                <p className="text-[12px] text-[#434745]">
                  {payment.registeredDate}
                </p>
              </div>
              <div className="">
                <p className="text-[11px] text-[#6D6D6D]">
                  Session Count Per Month
                </p>
                <p className="text-[12px] text-[#434745]">
                  {payment.sessionCount}
                </p>
              </div>
            </div>

            <div className="flex gap-20 mt-2">
              <div className="">
                <p className="text-[11px] text-[#6D6D6D]">Month</p>
                <p className="text-[12px] text-[#434745]">{payment.month}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#6D6D6D]">Salary Amount</p>
                <p className="text-[12px] text-[#434745]">
                  {payment.salaryAmount}
                </p>
              </div>
            </div>

            <div className="mt-2">
              <p className="text-[11px] text-[#6D6D6D]">Payment Status</p>
              {payment.status === "unpaid" ? (
                <Badge
                  onClick={() => handleSettlePayment(payment)}
                  className="w-[101px] h-[19px] rounded-[15px] bg-[#D32F2F] text-white text-[11px] cursor-pointer flex items-center justify-center"
                >
                  Settle Payment
                </Badge>
              ) : (
                <Badge className="bg-[#4CAF50] text-white rounded-[15px] text-[12px] w-[60px] h-[19px] flex items-center justify-center">
                  Paid
                </Badge>
              )}
            </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <div className="absolute right-0 top-20">
            <button className="w-[35px] h-[50px] bg-gray-100 rounded-tl-[30px] rounded-bl-[30px] flex items-center justify-center">
              <i className="update-icon size-[20.5px] " />
            </button>
          </div>
        </DrawerTrigger>
        <DrawerContent className="px-0 pt-0 pb-1 max-h-[90vh] h-[700px]">
          <ScrollArea className="h-full">
            <div className="px-4">
              <div className="mx-auto w-full max-w-md">
                <DrawerHeader className="px-0 py-1">
                  <DrawerClose asChild>
                    <div className="flex items-center gap-2 mb-4">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-[11px] w-[11px] bg-[#ffff] border-none"
                      >
                        <i className="back-icon size-[20.5px] " />
                      </Button>
                      <span className="text-[11px]">Back</span>
                    </div>
                  </DrawerClose>
                  <DrawerTitle className="text-[16px] font-[600] flex items-center justify-between">
                    Payment History
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-[36.8px] w-[36.8px]"
                        >
                          <Calendar className="h-[18px] w-[18px]" />
                          <span className="sr-only">Calendar</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="text-left text-[14px]">
                            Pick Date Range
                          </DialogTitle>
                        </DialogHeader>
                        <CalendarForm />
                      </DialogContent>
                    </Dialog>
                  </DrawerTitle>
                </DrawerHeader>
              </div>

              {trainerType === Type.PART_TIME
                ? renderPartTimeContent()
                : renderFullTimeContent()}
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>

      
      <Drawer open={showSettlementDialog} onOpenChange={setShowSettlementDialog}>
        <DrawerContent className="w-full max-w-md p-0">
          <DrawerHeader>
            <DrawerClose asChild>
              <div className="flex items-center gap-2 mb-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-[11px] w-[11px] bg-[#ffff] border-none"
                >
                  <i className="back-icon size-[20.5px]" />
                </Button>
                <span className="text-xs">Back</span>
              </div>
            </DrawerClose>
            <DrawerTitle className="text-sm text-gray-800 text-center">
              Payment Settlement
            </DrawerTitle>
          </DrawerHeader>

          <div className="px-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
                <div className="mt-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormLabel className="text-[10.8px]">Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Name"
                            className="w-full p-4 text-[12.6px] rounded-[11.7px] border-[#3D3D3D]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-4">
                  {" "}
                  <FormField
                    control={form.control}
                    name="nic"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormLabel className="text-[10.8px]">NIC</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="NIC"
                            className="w-full p-4 text-[12.6px] rounded-[11.7px] border-[#3D3D3D]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormLabel className="text-[10.8px]">Amount</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Add amount"
                            className="w-full p-4 text-[12.6px] rounded-[11.7px] border-[#3D3D3D]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full p-4 text-[12.6px] rounded-[11.7px] border-[#3D3D3D]"
                    onClick={() => setShowSettlementDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="w-full p-4 text-[12.6px] rounded-[10px]  bg-[#378644] hover:bg-[#378644] text-white "
                  >
                    Settle
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog
        open={showConfirmationDialog}
        onOpenChange={setShowConfirmationDialog}
      >
        <DialogContent className="w-[313px] h-[207px] rounded-[10px] sm:rounded-[10px] px-1">
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-3">
            <div className="p-1 mb-1">
              <i className="correct-icon size-[48] text-[#4CAF50]" />
            </div>
            <p className="text-center text-[#757575] text-[13px] mb-3">
              Payment settled successfully!
            </p>

            <Button
              onClick={() => setShowConfirmationDialog(false)}
              className="w-[280px] h-[39px] bg-[#4CAF50] hover:bg-[#4CAF50] rounded-[8px]"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PaymentHistory;
