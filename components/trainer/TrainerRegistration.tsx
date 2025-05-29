"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { registerTrainer, trainerSchema } from "@/actions/trainers";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

export function TrainerRegistration() {
  const [open, setOpen] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(trainerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      mobileNumber: "+94",
      email: "",
      nic: "",
      type: undefined,
      session: "",
    },
  });

  const trainerType = form.watch("type");

  const onSubmit = async (values: z.infer<typeof trainerSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await registerTrainer(values);
      
      if (result.status === "SUCCESS") {
        setOpen(false);
        setShowSuccessDialog(true);
        form.reset();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Trainer registration error:", error);
      toast.error(
        error instanceof Error
          ? `An unexpected error occurred: ${error.message}`
          : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <div className="flex gap-2 mb-0 pl-3 pr-3">
            <Button className="w-full bg-[#44424D] text-[9.62px] mb-4 flex items-center justify-center rounded-[23.48px]">
              <i className="add-people-icon bg-[#FFFFFF] h-[12px] w-[11.5px]" />
              Add New Trainer
            </Button>
          </div>
        </DrawerTrigger>
        <DrawerContent className="px-4 pt-0 pb-1 max-h-[90vh]">
          <div className="mx-auto w-full max-w-md overflow-y-auto max-h-[80vh] px-2">
            <DrawerHeader className="px-0 py-3 sticky top-0 bg-white z-10">
              <DrawerTitle className="text-center text-[16px] font-[500]">
                Trainer Registration Form
              </DrawerTitle>
            </DrawerHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 pb-4"
              >
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-[400]">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="First Name"
                          {...field}
                          className="text-[14px] text-[#9E9E9E] rounded-[10px] border-[1px] border-[#BDBDBD]"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-[400]">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Last Name"
                          {...field}
                          className="text-[14px] text-[#9E9E9E] rounded-[10px] border-[1px] border-[#BDBDBD]"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-[400]">
                        Mobile Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+94"
                          {...field}
                          className="text-[14px] text-[#9E9E9E] rounded-[10px] border-[1px] border-[#BDBDBD]"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-[400]">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Email"
                          {...field}
                          className="text-[14px] text-[#9E9E9E] rounded-[10px] border-[1px] border-[#BDBDBD]"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-[400]">
                        NIC
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="NIC"
                          {...field}
                          className="text-[14px] text-[#9E9E9E] rounded-[10px] border-[1px] border-[#BDBDBD]"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-[400]">
                        Type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="text-[14px] text-[#9E9E9E] rounded-[10px] border-[1px] w-full">
                            <SelectValue placeholder="Part Time / Full Time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="part-time" className="text-[13px]">
                            Part Time
                          </SelectItem>
                          <SelectItem value="full-time" className="text-[13px]">
                            Full Time
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {trainerType === "full-time" && (
                  <FormField
                    control={form.control}
                    name="session"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[14px] font-[400]">
                          Planned sessions (for full time trainers only)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Add"
                            {...field}
                            className="text-[14px] text-[#9E9E9E] rounded-[10px] border-[1px] border-[#BDBDBD]"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                )}

                <DrawerFooter className="px-0 pt-4 pb-0 sticky bottom-0 bg-white z-10">
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <DrawerClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-[10px] border-[#69716C]"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </DrawerClose>
                    <Button
                      type="submit"
                      className="rounded-[10px] bg-[#378644] text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Create"
                      )}
                    </Button>
                  </div>
                </DrawerFooter>
              </form>
            </Form>
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="w-[313px] h-[207px] rounded-[10px] sm:rounded-[10px] px-1">
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center">
            <div className="p-1 mb-0">
              <i className="correct-icon size-[48] text-[#4CAF50]" />
            </div>
            <h2 className="text-[14px] text-[#757575]">
              Registration Successful!
            </h2>
            <p className="text-center text-[13px] text-[#757575]">
              The trainer has been successfully registered!
            </p>
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="w-[280px] h-[39px] bg-[#378644] text-white mt-2"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}