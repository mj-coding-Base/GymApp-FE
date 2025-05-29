"use client";

import React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useViewGroupDetails } from "@/hooks/useGroupDetailsSheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useGroupDetailsStore } from "@/hooks/useGroupDetailsStore";
import { useSuccessModal } from "@/hooks/modals/useSuccessModal";

const formSchema = z.object({
  package: z
    .string({
      required_error: "Please select a package",
    })
    .min(1, "Please select a package"),
  feePerMember: z.string({
    required_error: "Please enter fee per member",
  }),
});

function AddNewGroup() {
  const { openAddNewGroup, setOpenAddNewGroup } = useViewGroupDetails();
  const { newUserGroupRegisterData } = useGroupDetailsStore();
  const { setOpenSuccessModal, setSuccessData } = useSuccessModal();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async () => {
    // let response;

    if (newUserGroupRegisterData) {
      // If update
      setSuccessData({
        title: `Registration Successful!`,
        description: `The group has been successfully registered!`,
        backButtonText: "Done",
        function: () => {},
      });
      setOpenAddNewGroup(false);
      setOpenSuccessModal(true);
    } else {
      // If create new
      setSuccessData({
        title: `Registration Successful!`,
        description: `The group has been successfully registered!`,
        backButtonText: "Done",
        function: () => {},
      });
      setOpenAddNewGroup(false);
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

  // useEffect(() => {
  //   if (openAddNewGroup && newUserGroupRegisterData) {
  //     form.reset({
  //       firstName: data.name,
  //       lastName: data.name,
  //       mobileNumber: +94778765433,
  //       email: "test@gmail.com",
  //       nic: "986654556V",
  //       programFee: 7800,
  //       package: "Boxfit Extreme",
  //     });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [newUserGroupRegisterData, openAddNewGroup]);

  return (
    <div className="">
      <Sheet open={openAddNewGroup} onOpenChange={setOpenAddNewGroup}>
        <SheetContent
          side="bottom"
          hideClose={true}
          className="overflow-y-auto rounded-t-2xl min-h-[600px] max-h-[calc(100%-40px)] px-[16px] pt-[16px] pb-[30px] gap-5"
        >
          <SheetHeader className="hidden">
            <SheetTitle></SheetTitle>
          </SheetHeader>

          <h1 className="text-[16px]/[19px] font-medium text-[#212121] text-center">
            {"New User Group Registration"}
          </h1>

          <div className="flex flex-col">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col h-full gap-[15px]"
              >
                <div className="flex flex-1 flex-col gap-[15px]">
                  <FormField
                    control={form.control}
                    name="package"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-[4px]">
                        <FormLabel className="font-normal text-[14px]/[17px]">
                          Package
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]">
                              <SelectValue placeholder="Select Package" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="boxfitExtreme">
                              Boxfit Extreme
                            </SelectItem>
                            <SelectItem value="boxfitInHealthy">
                              BoxFit In Healthy
                            </SelectItem>
                            <SelectItem value="boxfitBoxer">
                              BoxFit Boxer
                            </SelectItem>
                            <SelectItem value="boxfitCasual">
                              BoxFit Casual
                            </SelectItem>
                            <SelectItem value="boxfitOnline">
                              BoxFit Online
                            </SelectItem>
                          </SelectContent>
                        </Select>
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
                            placeholder="Add"
                            className="rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="border-[0.9px] border-[#5D5D5D] flex items-center px-[13.5px] rounded-[9px] overflow-hidden">
                    <Accordion
                      type="single"
                      collapsible
                      className="w-full"
                      defaultValue="item-1"
                    >
                      <AccordionItem value="item-1">
                        <AccordionTrigger className="text-[12.6px] font-medium text-[#212121]">
                          Primary Member
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-[13.5px]">
                          <div className="flex flex-col gap-[9px]">
                            <Label className="font-normal text-[14px]/[17px]">
                              First Name
                            </Label>
                            <Input
                              placeholder="First Name"
                              className="rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
                            />
                          </div>
                          <div className="flex flex-col gap-[9px]">
                            <Label className="font-normal text-[14px]/[17px]">
                              Last Name
                            </Label>
                            <Input
                              placeholder="Last Name"
                              className="rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
                            />
                          </div>
                          <div className="flex flex-col gap-[9px]">
                            <Label className="font-normal text-[14px]/[17px]">
                              Mobile Number
                            </Label>
                            <Input
                              placeholder="+94"
                              className="rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
                            />
                          </div>
                          <div className="flex flex-col gap-[9px]">
                            <Label className="font-normal text-[14px]/[17px]">
                              NIC
                            </Label>
                            <Input
                              placeholder="NIC"
                              className="rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
                            />
                          </div>
                          <div className="flex flex-col gap-[9px]">
                            <Label className="font-normal text-[14px]/[17px]">
                              Email
                            </Label>
                            <Input
                              placeholder="Email"
                              className="rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  <div className="border-[0.9px] border-[#5D5D5D] flex items-center px-[13.5px] rounded-[9px] overflow-hidden">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger className="text-[12.6px] font-medium text-[#212121]">
                          Member 2
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-[13.5px]">
                          <div className="flex gap-[9px]">
                            <div className="flex flex-col gap-[9px]">
                              <Label className="font-normal text-[14px]/[17px]">
                                First Name
                              </Label>
                              <Input
                                placeholder="First Name"
                                className="rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
                              />
                            </div>
                            <div className="flex flex-col gap-[9px]">
                              <Label className="font-normal text-[14px]/[17px]">
                                Last Name
                              </Label>
                              <Input
                                placeholder="Last Name"
                                className="rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
                              />
                            </div>
                          </div>

                          <div className="flex gap-[9px]">
                            <div className="flex flex-col gap-[9px]">
                              <Label className="font-normal text-[14px]/[17px]">
                                Mobile Number
                              </Label>
                              <Input
                                placeholder="+94"
                                className="rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
                              />
                            </div>
                            <div className="flex flex-col gap-[9px]">
                              <Label className="font-normal text-[14px]/[17px]">
                                NIC
                              </Label>
                              <Input
                                placeholder="NIC"
                                className="rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-[9px]">
                            <Label className="font-normal text-[14px]/[17px]">
                              Email
                            </Label>
                            <Input
                              placeholder="Email"
                              className="rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
                            />
                          </div>

                          <div className="flex flex-col gap-[9px]">
                            <Label className="font-normal text-[14px]/[17px]">
                              Relationship
                            </Label>
                            <div className="rounded-md border-[#BDBDBD] border-[1px] p-[12px]">
                              <RadioGroup defaultValue="noRelation">
                                <div className="flex items-center justify-between space-x-2">
                                  <Label
                                    htmlFor="noRelation"
                                    className="flex-1 text-[#3D3D3D] text-[14px]/[17px]"
                                  >
                                    1. No relation
                                  </Label>
                                  <RadioGroupItem
                                    value="noRelation"
                                    id="noRelation"
                                  />
                                </div>
                                <div className="flex items-center justify-between space-x-2">
                                  <Label
                                    htmlFor="husbandWife"
                                    className="flex-1 text-[#3D3D3D] text-[14px]/[17px]"
                                  >
                                    2. Husband/Wife
                                  </Label>
                                  <RadioGroupItem
                                    value="husbandWife"
                                    id="husbandWife"
                                  />
                                </div>
                                <div className="flex items-center justify-between space-x-2">
                                  <Label
                                    htmlFor="brother"
                                    className="flex-1 text-[#3D3D3D] text-[14px]/[17px]"
                                  >
                                    3. Brother
                                  </Label>
                                  <RadioGroupItem
                                    value="brother"
                                    id="brother"
                                  />
                                </div>
                                <div className="flex items-center justify-between space-x-2">
                                  <Label
                                    htmlFor="sister"
                                    className="flex-1 text-[#3D3D3D] text-[14px]/[17px]"
                                  >
                                    4. Sister
                                  </Label>
                                  <RadioGroupItem value="sister" id="sister" />
                                </div>
                                <div className="flex items-center justify-between space-x-2">
                                  <Label
                                    htmlFor="friend"
                                    className="flex-1 text-[#3D3D3D] text-[14px]/[17px]"
                                  >
                                    5. Friend
                                  </Label>
                                  <RadioGroupItem value="friend" id="friend" />
                                </div>
                              </RadioGroup>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                  <div className="border-[0.9px] border-[#5D5D5D] flex items-center px-[13.5px] rounded-[9px] overflow-hidden">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger className="text-[12.6px] font-medium text-[#212121]">
                          Member 3
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-[13.5px]">
                          <div className="flex gap-[9px]">
                            <div className="flex flex-col gap-[9px]">
                              <Label className="font-normal text-[14px]/[17px]">
                                First Name
                              </Label>
                              <Input
                                placeholder="First Name"
                                className="rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
                              />
                            </div>
                            <div className="flex flex-col gap-[9px]">
                              <Label className="font-normal text-[14px]/[17px]">
                                Last Name
                              </Label>
                              <Input
                                placeholder="Last Name"
                                className="rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
                              />
                            </div>
                          </div>

                          <div className="flex gap-[9px]">
                            <div className="flex flex-col gap-[9px]">
                              <Label className="font-normal text-[14px]/[17px]">
                                Mobile Number
                              </Label>
                              <Input
                                placeholder="+94"
                                className="rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
                              />
                            </div>
                            <div className="flex flex-col gap-[9px]">
                              <Label className="font-normal text-[14px]/[17px]">
                                NIC
                              </Label>
                              <Input
                                placeholder="NIC"
                                className="rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-[9px]">
                            <Label className="font-normal text-[14px]/[17px]">
                              Email
                            </Label>
                            <Input
                              placeholder="Email"
                              className="rounded-[10px] border-[#BDBDBD] text-[14px]/[17px] h-[41px] placeholder:text-[#9E9E9E] placeholder:text-[14px]/[17px]"
                            />
                          </div>

                          <div className="flex flex-col gap-[9px]">
                            <Label className="font-normal text-[14px]/[17px]">
                              Relationship
                            </Label>
                            <div className="rounded-md border-[#BDBDBD] border-[1px] p-[12px]">
                              <RadioGroup defaultValue="noRelation">
                                <div className="flex items-center justify-between space-x-2">
                                  <Label
                                    htmlFor="noRelation"
                                    className="flex-1 text-[#3D3D3D] text-[14px]/[17px]"
                                  >
                                    1. No relation
                                  </Label>
                                  <RadioGroupItem
                                    value="noRelation"
                                    id="noRelation"
                                  />
                                </div>
                                <div className="flex items-center justify-between space-x-2">
                                  <Label
                                    htmlFor="husbandWife"
                                    className="flex-1 text-[#3D3D3D] text-[14px]/[17px]"
                                  >
                                    2. Husband/Wife
                                  </Label>
                                  <RadioGroupItem
                                    value="husbandWife"
                                    id="husbandWife"
                                  />
                                </div>
                                <div className="flex items-center justify-between space-x-2">
                                  <Label
                                    htmlFor="brother"
                                    className="flex-1 text-[#3D3D3D] text-[14px]/[17px]"
                                  >
                                    3. Brother
                                  </Label>
                                  <RadioGroupItem
                                    value="brother"
                                    id="brother"
                                  />
                                </div>
                                <div className="flex items-center justify-between space-x-2">
                                  <Label
                                    htmlFor="sister"
                                    className="flex-1 text-[#3D3D3D] text-[14px]/[17px]"
                                  >
                                    4. Sister
                                  </Label>
                                  <RadioGroupItem value="sister" id="sister" />
                                </div>
                                <div className="flex items-center justify-between space-x-2">
                                  <Label
                                    htmlFor="friend"
                                    className="flex-1 text-[#3D3D3D] text-[14px]/[17px]"
                                  >
                                    5. Friend
                                  </Label>
                                  <RadioGroupItem value="friend" id="friend" />
                                </div>
                              </RadioGroup>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>

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
                      "Create"
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

export default AddNewGroup;
