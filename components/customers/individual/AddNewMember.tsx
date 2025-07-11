/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createIndividualCustomer, updateCustomer } from "@/actions/customers";
import { fetchAllPackages } from "@/actions/package";
import { ErrorToast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSuccessModal } from "@/hooks/modals/useSuccessModal";
import { NewIndividualCustomer } from "@/types/Customer";
import { Package } from "@/types/Packages";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
  addressLine1: z
    .string({ required_error: "Address Line 1 is required" })
    .min(1, "Address Line 1 is required")
    .max(200, "Address too long"),
  addressLine2: z
    .string({ required_error: "Address Line 1 is required" })
    .max(200, "Address too long")
    .optional(),
  packageId: z.string({ required_error: "Package is required" }),
  isMale: z.boolean({
    required_error: "Gender selection is required",
  }),
  isMarried: z.boolean({
    required_error: "Marital status is required",
  }),
  dob: z.object({
    year: z.string({ required_error: "Year is required" }),
    month: z.string({ required_error: "Month is required" }),
    day: z.string({ required_error: "Day is required" }),
  }),
  whyJoin: z.enum([
    "Bulking", 
    "Strength", 
    "Fatloss", 
    "Regular Fitness", 
    "Extreme Training", 
    "Athletic"
  ], {
    required_error: "Please select why you're joining",
  }),
  profession: z
    .string({ required_error: "Profession is required" })
    .min(1, "Profession is required")
    .max(100, "Profession too long"),
});

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i).map(String);
const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

interface AddNewMemberProps {
  readonly open: boolean;
  readonly setOpen: (value: boolean) => void;
  readonly data: NewIndividualCustomer | null;
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
      mobileNumber: "+94",
      email: "",
      nic: "",
      addressLine1: "",
      addressLine2: "",
      packageId: "",
      isMale: true,
      isMarried: false,
      dob: {
        year: "",
        month: "",
        day: "",
      },
      whyJoin: "Regular Fitness",
      profession: "",
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
        firstName: data.firstName,
        lastName: data.lastName,
        mobileNumber: data.mobileNumber,
        email: data.email,
        nic: data.nic,
        addressLine1: data.addressLine1 ,
        addressLine2: data.addressLine2 ,
        packageId: data.packageId,
        isMale: data.isMale,
        isMarried: data.isMarried,
        dob: {
          year: data.dob ? new Date(data.dob).getFullYear().toString() : "",
          month: data.dob ? (new Date(data.dob).getMonth() + 1).toString().padStart(2, '0') : "",
          day: data.dob ? new Date(data.dob).getDate().toString().padStart(2, '0') : "",
        },
        whyJoin: data.whyJoin as any,
        profession: data.profession || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, open]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let response;

    setIsSubmitting(true);
    try {
      const customerData = {
        ...values,
        dob: new Date(`${values.dob.year}-${values.dob.month}-${values.dob.day}`).toISOString(),
        addressLine2: values.addressLine2 ?? "",
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
            ? `${customerData.firstName} has been successfully registered!`
            : `${customerData.firstName}'s details have been successfully updated!`,
          backButtonText: "Done",
          function: () => {},
        });
        setOpenSuccessModal(true);
      } else {
        toast.error(response.message || "Operation failed");
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
                name="addressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1*</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Street address, P.O. Box, etc."
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
                name="addressLine2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Apartment, suite, unit, etc."
                        className="rounded-[10px] h-[41px]"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isMale"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Gender*</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === "male")}
                          defaultValue={field.value ? "male" : "female"}
                          className="flex gap-4"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="male" />
                            </FormControl>
                            <FormLabel className="font-normal">Male</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="female" />
                            </FormControl>
                            <FormLabel className="font-normal">Female</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isMarried"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Marital Status*</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === "married")}
                          defaultValue={field.value ? "married" : "single"}
                          className="flex gap-4"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="married" />
                            </FormControl>
                            <FormLabel className="font-normal">Married</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="single" />
                            </FormControl>
                            <FormLabel className="font-normal">Single</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth*</FormLabel>
                    <div className="grid grid-cols-3 gap-3">
                      <Select
                        onValueChange={(value) => field.onChange({ ...field.value, year: value })}
                        value={field.value.year}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-[10px] h-[41px]">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        onValueChange={(value) => field.onChange({ ...field.value, month: value })}
                        value={field.value.month}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-[10px] h-[41px]">
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        onValueChange={(value) => field.onChange({ ...field.value, day: value })}
                        value={field.value.day}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-[10px] h-[41px]">
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {days.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whyJoin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why are you joining?*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-[10px] h-[41px]">
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Bulking">Bulking</SelectItem>
                        <SelectItem value="Strength">Strength</SelectItem>
                        <SelectItem value="Fatloss">Fatloss</SelectItem>
                        <SelectItem value="Regular Fitness">Regular Fitness</SelectItem>
                        <SelectItem value="Extreme Training">Extreme Training</SelectItem>
                        <SelectItem value="Athletic">Athletic</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profession*</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Your profession"
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
                name="packageId"
                render={({ field }) => {
                  const selectedPackage = packages.find((pkg) => pkg.packageId === field.value);

                  return (
                    <FormItem>
                      <FormLabel>Package*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loadingPackages || isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-[10px] h-[41px] w-full">
                            <SelectValue
                              placeholder={
                                selectedPackage
                                  ? selectedPackage.name
                                  : "Select Package"
                              }
                            />
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
                              <SelectItem key={pkg.packageId} value={pkg.packageId}>
                                {pkg.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-center">No packages available</div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
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