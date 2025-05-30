/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { IndividualCustomer } from "@/types/Customer";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSuccessModal } from "@/hooks/modals/useSuccessModal";
import { createIndividualCustomer, updateCustomer } from "@/actions/customers";
import { Package } from "@/types/Packages";
import { toast } from "sonner";
import { fetchAllPackages } from "@/actions/package";
import { ErrorToast } from "@/components/common/toast";

// Enhanced form schema with better validation
const formSchema = z.object({
  firstName: z
    .string({ required_error: "First name is required" })
    .min(1, "First name is required")
    .max(100, "First name too long")
    .regex(/^[a-zA-Z\s]+$/, "Only alphabets and spaces allowed"),
  lastName: z
    .string({ required_error: "Last name is required" })
    .min(1, "Last name is required")
    .max(100, "Last name too long")
    .regex(/^[a-zA-Z\s]+$/, "Only alphabets and spaces allowed"),
  mobileNumber: z
    .string({ required_error: "Mobile number is required" })
    .regex(
      /^\+?\d{10,12}$/,
      "Invalid mobile number format (e.g., +94771234567)"
    ),
  nic: z
    .string({ required_error: "NIC is required" })
    .min(10, "NIC too short")
    .max(12, "NIC too long")
    .regex(
      /^([0-9]{9}[vVxX]|[0-9]{12})$/,
      "Invalid NIC format (123456789V or 123456789012)"
    ),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format"),
  programFee: z.coerce
    .number({ required_error: "Program fee is required" })
    .min(0, "Fee cannot be negative")
    .max(1000000, "Fee too large"),
  package: z.string({ required_error: "Package is required" }),
});

interface AddNewMemberProps {
  readonly open: boolean;
  readonly setOpen: (value: boolean) => void;
  readonly data: IndividualCustomer | null;
}

function AddNewMember({ open, setOpen, data }: AddNewMemberProps) {
  const { setOpenSuccessModal, setSuccessData } = useSuccessModal();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      mobileNumber: "",
      email: "",
      nic: "",
      programFee: 0,
      package: "",
    },
  });

  const fetchPackages = async () => {
    try {
      setLoadingPackages(true);
      const res = await fetchAllPackages();
      setPackages(res);
    } catch (error) {
      console.error("Failed to fetch packages:", error);
      toast.error("Failed to load packages. Please try again.");
    } finally {
      setLoadingPackages(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPackages();
      // Reset form when opening
      if (!data) {
        form.reset();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open && data) {
      form.reset({
        firstName: data.first_name,
        lastName: data.last_name,
        mobileNumber: data.phone,
        email: data.email,
        nic: data.nic,
        programFee: data.fee,
        package: data.package_id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, open]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let response;

    setIsSubmitting(true);
    try {
      const customerData = {
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        phone: values.mobileNumber,
        email: values.email.toLowerCase().trim(),
        nic: values.nic.toUpperCase(),
        package_id: values.package,
        fee: values.programFee,
      };

      if (data) {
        // Update existing customer
        response = await updateCustomer(data._id, customerData);
      } else {
        // Create new customer
        response = await createIndividualCustomer(customerData);
      }

      if (response.status === "SUCCESS") {
        form.reset();
        setOpen(false);
        setSuccessData({
          title: !data ? "Registration Successful!" : "Client Updated!",
          description: !data
            ? `${customerData.first_name} has been successfully registered!`
            : `${customerData.first_name}'s details have been successfully updated!`,
          backButtonText: "Done",
          function: () => {},
        });
        setOpenSuccessModal(true);
      } else {
      }
    } catch (error: any) {
      console.error("Operation failed:", error);
      ErrorToast(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="bottom"
        hideClose={true}
        className="overflow-y-auto rounded-t-2xl min-h-[600px] max-h-[calc(100%-40px)] px-[16px] pt-[16px] pb-[30px] gap-5"
      >
        <SheetHeader className="hidden">
          <SheetTitle></SheetTitle>
        </SheetHeader>

        <h1 className="text-[16px]/[19px] font-medium text-[#212121] text-center">
          {data ? "Update Client Details" : "Individual Registration Form"}
        </h1>

        <div className="flex flex-col gap-[15px]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-[1rem]"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name*</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="First Name"
                          className="rounded-[10px] h-[41px]"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name*</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Last Name"
                          className="rounded-[10px] h-[41px]"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number*</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="+94771234567"
                        className="rounded-[10px] h-[41px]"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="email@example.com"
                        className="rounded-[10px] h-[41px]"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIC*</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="123456789V or 123456789012"
                        className="rounded-[10px] h-[41px]"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="programFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program Fee (LKR)*</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0.00"
                        className="rounded-[10px] h-[41px]"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="package"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loadingPackages || isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-[10px] h-[41px] w-full">
                          <SelectValue placeholder="Select Package" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingPackages ? (
                          <div className="p-2 text-center">
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            Loading packages...
                          </div>
                        ) : packages.length > 0 ? (
                          packages.map((pkg) => (
                            <SelectItem key={pkg._id} value={pkg._id}>
                              {pkg.package_name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center">
                            No packages available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-[15px] pt-4">
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    className="border-[#69716C] rounded-[10px] h-[40px]"
                    type="button"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </SheetClose>
                <Button
                  type="submit"
                  className="bg-[#378644] rounded-[10px] h-[40px] hover:bg-[#2d7038]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : data ? (
                    "Update Client"
                  ) : (
                    "Register Client"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default AddNewMember;