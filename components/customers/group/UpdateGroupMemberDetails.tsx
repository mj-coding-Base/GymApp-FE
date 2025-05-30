"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { useViewGroupDetails } from "@/hooks/useGroupDetailsSheet";
import { useGroupDetailsStore } from "@/hooks/useGroupDetailsStore";
import { useSuccessModal } from "@/hooks/modals/useSuccessModal";

const formSchema = z.object({
  firstName: z
    .string({
      required_error: "Please enter first name",
    })
    .min(1, "Please enter first name")
    .max(100, "Input exceeds the allowed character limit."),
  lastName: z
    .string({
      required_error: "Please enter last name",
    })
    .min(1, "Please enter last name")
    .max(100, "Input exceeds the allowed character limit."),
  mobileNumber: z.coerce
    .number({
      required_error: "Please enter mobile number",
    })
    .min(100000000, "Mobile number should be at least 10 digits"),
  nic: z
    .string({
      required_error: "Please enter NIC number",
    })
    .min(10, "NIC should be at least 10 characters")
    .max(12, "NIC should be at most 12 characters")
    .regex(
      /^([0-9]{9}[vVxX]|[0-9]{12})$/,
      "Invalid NIC format. Valid formats: 123456789V or 123456789012"
    ),
  email: z
    .string({
      required_error: "Please enter email address",
    })
    .email("Please enter a valid email address"),
  feePerMember: z.coerce
    .number({
      required_error: "Please enter program fee",
    })
    .min(0, "Program fee cannot be negative")
    .max(1000000, "Program fee is too large"),
});

function UpdateGroupMember() {
  const { openUpdateGroupMember, setOpenUpdateGroupMember } =
    useViewGroupDetails();
  const { updateGroupMemberData } = useGroupDetailsStore();
  const { setOpenSuccessModal, setSuccessData } = useSuccessModal();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async () => {
    // let response;

    if (updateGroupMemberData) {
      // If update
      setSuccessData({
        title: `Group Member Updated!`,
        description: `The group member details has been successfully updated!`,
        backButtonText: "Done",
        function: () => {},
      });
      setOpenUpdateGroupMember(false);
      setOpenSuccessModal(true);
    } else {
      // If create new
      setSuccessData({
        title: `Group Member Updated!`,
        description: `The group member details has been successfully updated!`,
        backButtonText: "Done",
        function: () => {},
      });
      setOpenUpdateGroupMember(false);
      setOpenSuccessModal(true);
    }

    // if (response.status === "SUCCESS") {
    //   const itemName = form.getValues("name");

    //   form.reset({
    //     name: undefined,
    //     availableUnits: undefined,
    //     unitPrice: undefined,
    //     description: undefined,
    //     images: [],
    //     pricePer: undefined,
    //   });
    //   setOpen(false);
    //   setSuccessData({
    //     title: !data
    //       ? `Item ${itemName} has been successfully added to ${categoryName}.`
    //       : `Item ${data.name} has been successfully updated.`,
    //     backButtonText: "Done",
    //     function: () => {},
    //   });

    //   setOpenSuccessModal(true);
    // } else {
    //   toast({
    //     title: response.message,
    //     variant: "error",
    //   });
    // }
  };

  useEffect(() => {
    if (openUpdateGroupMember && updateGroupMemberData) {
      form.reset({
        firstName: updateGroupMemberData.firstName,
        lastName: updateGroupMemberData.lastName,
        mobileNumber: updateGroupMemberData.mobileNumber,
        email: updateGroupMemberData.email,
        nic: updateGroupMemberData.nic,
        feePerMember: updateGroupMemberData.feePerMember,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateGroupMemberData, openUpdateGroupMember]);

  return (
    <div className="">
      <Sheet
        open={openUpdateGroupMember}
        onOpenChange={setOpenUpdateGroupMember}
      >
        <SheetContent
          side="bottom"
          hideClose={true}
          className="overflow-y-auto rounded-t-2xl min-h-[600px] max-h-[calc(100%-40px)] px-[16px] pt-[16px] pb-[30px] gap-5"
        >
          <SheetHeader className="hidden">
            <SheetTitle></SheetTitle>
          </SheetHeader>

          <h1 className="text-[16px]/[19px] font-medium text-[#212121] text-center">
            {"Update Group Member Details"}
          </h1>

          <div className="flex flex-col gap-[15px]">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-[1rem]"
              >
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-[4px]">
                      <FormLabel className="font-normal text-[14px]/[17px]">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="First Name"
                          className="rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
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
                    <FormItem className="flex flex-col gap-[4px]">
                      <FormLabel className="font-normal text-[14px]/[17px]">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Last Name"
                          className="rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-[4px]">
                      <FormLabel className="font-normal text-[14px]/[17px]">
                        Mobile Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="+94"
                          className="rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
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
                    <FormItem className="flex flex-col gap-[4px]">
                      <FormLabel className="font-normal text-[14px]/[17px]">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Email"
                          className="rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
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
                    <FormItem className="flex flex-col gap-[4px]">
                      <FormLabel className="font-normal text-[14px]/[17px]">
                        NIC
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="NIC"
                          className="rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="feePerMember"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-[4px]">
                      <FormLabel className="font-normal text-[14px]/[17px]">
                        Fee Per Member
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Fee"
                          className="rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-[15px]">
                  <SheetClose asChild className="flex">
                    <Button
                      variant={"outline"}
                      className="border-[#69716C] rounded-[10px] text-[13px] font-semibold text-[#69716C] h-[40px]"
                    >
                      Cancel
                    </Button>
                  </SheetClose>
                  <Button
                    disabled={form.formState.isSubmitting}
                    type="submit"
                    className="bg-[#378644] rounded-[10px] text-[13px] font-semibold text-[#FFFFFF]  h-[40px]"
                  >
                    {form.formState.isSubmitting ? (
                      <Loader2 className="size-6 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default UpdateGroupMember;