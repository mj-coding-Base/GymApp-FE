/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createIndividualCustomer, getProfilePictureUrl, updateCustomer, uploadProfilePicture } from "@/actions/customers";
import { fetchAllPackages } from "@/actions/package";
import { ImageUpload } from "@/components/common/ImageUpload";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { useSuccessModal } from "@/hooks/modals/useSuccessModal";
import { cn } from "@/lib/utils";
import { NewIndividualCustomer } from "@/types/Customer";
import { Package } from "@/types/Packages";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
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
    .max(100, "First name too long"),
    // .regex(/^[a-zA-Z\s]+$/, "Only alphabets and spaces allowed"),
  lastName: z
    .string({ required_error: "Last name is required" })
    .min(1, "Last name is required")
    .max(100, "Last name too long"),
    // .regex(/^[a-zA-Z\s]+$/, "Only alphabets and spaces allowed"),
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
  deactivateAt: z.object({
    year: z.string().optional(),
    month: z.string().optional(),
    day: z.string().optional(),
  }).optional(),
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
  reference: z
    .string()
    .max(255, "Admission Number too long")
    .optional(),
});


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
  const [deactivateDate, setDeactivateDate] = useState<Date | undefined>(undefined);
  const [dobDate, setDobDate] = useState<Date | undefined>(undefined);
  const [dobCalendarMonth, setDobCalendarMonth] = useState<Date>(new Date(2014, 11, 1)); // December 2014
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [currentProfileImageUrl, setCurrentProfileImageUrl] = useState<string | null>(null);

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
      deactivateAt: {
        year: "not-set",
        month: "not-set",
        day: "not-set",
      },
      whyJoin: "Regular Fitness",
      profession: "",
      reference: "",
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
        setDeactivateDate(undefined);
        setDobDate(undefined);
        setDobCalendarMonth(new Date(2014, 11, 1)); // December 2014
        setProfileImage(null);
        setCurrentProfileImageUrl(null);
      } else {
        // Load existing profile picture if editing
        const loadProfilePicture = async () => {
          if (data.clientId) {
            const url = await getProfilePictureUrl(data.clientId);
            setCurrentProfileImageUrl(url);
          }
        };
        loadProfilePicture();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, data]);

  useEffect(() => {
    if (open && data) {
      const deactivateDateValue = data.deactivateAt ? new Date(data.deactivateAt) : undefined;
      const dobDateValue = data.dob ? new Date(data.dob) : undefined;
      setDeactivateDate(deactivateDateValue);
      setDobDate(dobDateValue);
      setDobCalendarMonth(dobDateValue && dobDateValue < new Date("2015-01-01") ? dobDateValue : new Date(2014, 11, 1));
      
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
        deactivateAt: {
          year: data.deactivateAt ? new Date(data.deactivateAt).getFullYear().toString() : "not-set",
          month: data.deactivateAt ? (new Date(data.deactivateAt).getMonth() + 1).toString().padStart(2, '0') : "not-set",
          day: data.deactivateAt ? new Date(data.deactivateAt).getDate().toString().padStart(2, '0') : "not-set",
        },
        whyJoin: data.whyJoin as any,
        profession: data.profession || "",
        reference: data.reference || "",
      });
    } else if (open && !data) {
      setDeactivateDate(undefined);
      setDobDate(undefined);
      setDobCalendarMonth(new Date(2014, 11, 1)); // December 2014
      setProfileImage(null);
      setCurrentProfileImageUrl(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, open]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (currentProfileImageUrl) {
        URL.revokeObjectURL(currentProfileImageUrl);
      }
    };
  }, [currentProfileImageUrl]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let response;

    setIsSubmitting(true);
    try {
      // Build dates from calendar selections
      let deactivateAtDate = "";
      if (deactivateDate) {
        deactivateAtDate = deactivateDate.toISOString();
      }

      if (!dobDate) {
        toast.error("Please select a date of birth");
        setIsSubmitting(false);
        return;
      }

      // Build customerData with only the fields we need to send
      const customerData = {
        firstName: values.firstName,
        lastName: values.lastName,
        mobileNumber: values.mobileNumber,
        email: values.email,
        nic: values.nic,
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2 ?? "",
        packageId: values.packageId,
        isMale: values.isMale,
        isMarried: values.isMarried,
        whyJoin: values.whyJoin,
        profession: values.profession,
        dob: dobDate.toISOString(),
        deactivateAt: deactivateAtDate,
        clientId: data?.clientId || undefined,
        reference: values.reference || undefined,
      };

      if (data) {
        // Update existing customer
        // console.log("Updating customer with data:", customerData);
        // console.log("Updating customer with data:", data.clientId);
        response = await updateCustomer(data.clientId, customerData);
      } else {
        // Create new customer
        response = await createIndividualCustomer(customerData);
      }

      if (response.status === "SUCCESS") {
        // Upload profile picture if a new one was selected
        // For new customers, the response.message contains the clientId in the format:
        // "FirstName LastName's registration number is CLIENTID"
        let clientIdToUse = data?.clientId;
        if (!clientIdToUse && response.message) {
          // Extract clientId from message (format: "... registration number is CLIENTID")
          const match = response.message.match(/registration number is (\S+)/);
          if (match && match[1]) {
            clientIdToUse = match[1];
          }
        }
        
        if (profileImage && clientIdToUse) {
          try {
            await uploadProfilePicture(clientIdToUse, profileImage);
          } catch (error) {
            console.error("Failed to upload profile picture:", error);
            toast.error("Customer saved but profile picture upload failed");
          }
        }

        form.reset();
        setProfileImage(null);
        setCurrentProfileImageUrl(null);
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
        // Show user-friendly error message
        const errorMsg = response.message || "Operation failed";
        toast.error(errorMsg);
        
        if (process.env.NODE_ENV !== 'production') {
          console.error("Customer operation error:", response);
        }
      }
    } catch (error: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Operation failed:", error);
      }
      
      // Extract user-friendly error message
      const errorMessage = error?.response?.data?.message || error?.message || "An unexpected error occurred";
      toast.error(errorMessage);
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dob"
                  render={() => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "rounded-[10px] h-[41px] text-left font-normal",
                                !dobDate && "text-muted-foreground"
                              )}
                              disabled={isSubmitting}
                            >
                              {dobDate ? (
                                format(dobDate, "MM/dd/yyyy")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 h-[340px] flex flex-col" align="start">
                          <div className="p-3 flex flex-col h-full">
                            <div className="flex gap-2 mb-3 flex-shrink-0">
                              <Select
                                value={dobCalendarMonth.getFullYear().toString()}
                                onValueChange={(year) => {
                                  const yearNum = Number.parseInt(year, 10);
                                  const newMonth = new Date(
                                    yearNum,
                                    dobCalendarMonth.getMonth(),
                                    1
                                  );
                                  setDobCalendarMonth(newMonth);
                                  if (dobDate) {
                                    const newDate = new Date(
                                      yearNum,
                                      dobDate.getMonth(),
                                      Math.min(dobDate.getDate(), new Date(yearNum, dobDate.getMonth() + 1, 0).getDate())
                                    );
                                    // Ensure date is before 2015
                                    if (newDate >= new Date("2015-01-01")) {
                                      return;
                                    }
                                    setDobDate(newDate);
                                    form.setValue("dob", {
                                      year: year,
                                      month: (newDate.getMonth() + 1).toString().padStart(2, '0'),
                                      day: newDate.getDate().toString().padStart(2, '0'),
                                    });
                                  }
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="h-[360px]">
                                  {Array.from({ length: 2014 - 1899 }, (_, i) => {
                                    const year = 2014 - i;
                                    return (
                                      <SelectItem key={year} value={year.toString()}>
                                        {year}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                              <Select
                                value={(dobCalendarMonth.getMonth() + 1).toString().padStart(2, '0')}
                                onValueChange={(month) => {
                                  const monthNum = Number.parseInt(month, 10) - 1;
                                  const newMonth = new Date(
                                    dobCalendarMonth.getFullYear(),
                                    monthNum,
                                    1
                                  );
                                  setDobCalendarMonth(newMonth);
                                  if (dobDate) {
                                    const newDate = new Date(
                                      dobDate.getFullYear(),
                                      monthNum,
                                      Math.min(dobDate.getDate(), new Date(dobDate.getFullYear(), monthNum + 1, 0).getDate())
                                    );
                                    // Ensure date is before 2015
                                    if (newDate >= new Date("2015-01-01")) {
                                      return;
                                    }
                                    setDobDate(newDate);
                                    form.setValue("dob", {
                                      year: newDate.getFullYear().toString(),
                                      month: month,
                                      day: newDate.getDate().toString().padStart(2, '0'),
                                    });
                                  }
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => {
                                    const month = i + 1;
                                    const date = new Date(2000, month - 1, 1);
                                    return (
                                      <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                                        {format(date, "MMMM")}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <Calendar
                                mode="single"
                                selected={dobDate}
                                onSelect={(date) => {
                                  if (date && date >= new Date("2015-01-01")) {
                                    toast.error("Date of birth must be earlier than 2015");
                                    return;
                                  }
                                  setDobDate(date || undefined);
                                  if (date) {
                                    setDobCalendarMonth(date);
                                    form.setValue("dob", {
                                      year: date.getFullYear().toString(),
                                      month: (date.getMonth() + 1).toString().padStart(2, '0'),
                                      day: date.getDate().toString().padStart(2, '0'),
                                    });
                                  }
                                }}
                                disabled={(date) => date >= new Date("2015-01-01") || date < new Date("1900-01-01")}
                                month={dobCalendarMonth}
                                onMonthChange={(date) => {
                                  // Prevent navigating to months in 2015 or later
                                  if (date >= new Date("2015-01-01")) {
                                    setDobCalendarMonth(new Date("2014-12-01"));
                                  } else {
                                    setDobCalendarMonth(date);
                                  }
                                }}
                                initialFocus
                              />
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deactivateAt"
                  render={() => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Deactivation Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "rounded-[10px] h-[41px] text-left font-normal",
                                !deactivateDate && "text-muted-foreground"
                              )}
                              disabled={isSubmitting}
                            >
                              {deactivateDate ? (
                                format(deactivateDate, "MM/dd/yyyy")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 h-[300px] flex flex-col" align="start">
                          <div className="p-3 flex flex-col h-full">
                            <div className="flex-1 overflow-hidden">
                              <Calendar
                                mode="single"
                                selected={deactivateDate}
                                onSelect={(date) => {
                                  setDeactivateDate(date);
                                  if (date) {
                                    form.setValue("deactivateAt", {
                                      year: date.getFullYear().toString(),
                                      month: (date.getMonth() + 1).toString().padStart(2, '0'),
                                      day: date.getDate().toString().padStart(2, '0'),
                                    });
                                  } else {
                                    form.setValue("deactivateAt", {
                                      year: "not-set",
                                      month: "not-set",
                                      day: "not-set",
                                    });
                                  }
                                }}
                                disabled={(date) => date < new Date("2000-01-01") || date > new Date("2027-12-31")}
                                defaultMonth={deactivateDate || new Date()}
                                initialFocus
                              />
                            </div>
                            {deactivateDate && (
                              <Button
                                type="button"
                                variant="ghost"
                                className="w-full mt-2 text-xs flex-shrink-0"
                                onClick={() => {
                                  setDeactivateDate(undefined);
                                  form.setValue("deactivateAt", {
                                    year: "not-set",
                                    month: "not-set",
                                    day: "not-set",
                                  });
                                }}
                              >
                                Clear date
                              </Button>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Admission Number (optional)"
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
                                  ? selectedPackage.package_name
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
                                {pkg.package_name}
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

              {/* Profile Picture Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <ImageUpload
                  id="profile-picture-upload"
                  label="Profile Picture"
                  onFileSelect={(file: File | null) => {
                    setProfileImage(file);
                  }}
                  maxSizeMB={10}
                  acceptedTypes={['image/jpeg', 'image/jpg', 'image/png']}
                  currentImageUrl={currentProfileImageUrl || undefined}
                />
              </div>

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