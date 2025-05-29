"use client";

import type React from "react";
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
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";


const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  mobileNumber: z.string().min(4, { message: "Mobile number is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  nic: z.string().min(1, { message: "NIC is required" }),
  type: z.string().min(1, { message: "Type is required" }),
  session: z.string().optional(),
});

export function TrainerRegistrationCard() {
  const [open, setOpen] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      mobileNumber: "+94",
      email: "",
      nic: "",
      type: "",
      session: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Form submitted:", values);
    setOpen(false);
    setShowSuccessDialog(true);
  };

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <div className="absolute right-0 top-4">
            <button className="w-[35px] h-[50px] bg-gray-100 rounded-tl-[30px] rounded-bl-[30px] flex items-center justify-center">
              <i className="edit-icon size-[20.5px]" />
            </button>
          </div>
        </DrawerTrigger>
        <DrawerContent className="px-4 pt-0 pb-1 max-h-[90vh] h-[700px]">
          <div className="mx-auto w-full max-w-md overflow-y-auto max-h-[80vh] px-2">
            <DrawerHeader className="px-0 py-1">
              <DrawerTitle className="text-center text-[16px] font-[500]">
                Update Trainer Details
              </DrawerTitle>
            </DrawerHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5 pb-4"
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
                          className="text-[14px] text-[#44424D] rounded-[10px] border-[1px] border-[#BDBDBD]"
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
                          className="text-[14px] text-[#44424D] rounded-[10px] border-[1px] border-[#BDBDBD]"
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
                          className="text-[14px] text-[#44424D] rounded-[10px] border-[1px] border-[#BDBDBD]"
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
                          className="text-[14px] text-[#44424D] rounded-[10px] border-[1px] border-[#BDBDBD]"
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
                          className="text-[14px] text-[#44424D] rounded-[10px] border-[1px] border-[#BDBDBD]"
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
                      <FormLabel className="text-[14px] font-[400] ">
                        Type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      
                      >
                        <FormControl>
                          <SelectTrigger className="text-[14px] text-[#44424D] rounded-[10px] border-[1px] w-full border-[#BDBDBD]">
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
                          className="text-[14px] text-[#44424D] rounded-[10px] border-[1px] border-[#BDBDBD]"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <DrawerFooter className="px-0 pt-4 pb-0 sticky bottom-0 bg-white z-10">
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <DrawerClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-[10px] border-[#69716C]"
                      >
                        Cancel
                      </Button>
                    </DrawerClose>
                    <Button
                      type="submit"
                      className="rounded-[10px] bg-[#378644] text-white"
                    >
                      Create
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
          
          <div className="flex flex-col items-center justify-center">
            <div className="p-1 mb-0">
              <i className="correct-icon size-[48] text-[#4CAF50]" />
            </div>
            <h2 className="text-[14px] text-[#757575]">Trainer Updated!</h2>
            <p className="text-center text-[13px] text-[#757575]">
              The trainer details has been successfully updated!
            </p>
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="w-[280px] h-[39px] mt-1 bg-[#378644] text-white "
            >
             Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
