"use client";

import { createNewPackage, packageSchema } from "@/actions/package";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface AddNewPackageProps {
  onPackageAdded?: () => void;
}

function AddNewPackage({ onPackageAdded }: AddNewPackageProps) {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      package_name: "",
      sessionsAllocated: undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof packageSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await createNewPackage(data);
      
      if (result.status === "SUCCESS") {
        setShowSuccessDialog(true);
        form.reset();
        onPackageAdded?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error creating new package:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Drawer>
        <DrawerTrigger asChild>
          <div className="w-full flex flex-col pl-2 pr-2 mt-3">
            <Button className="bg-[#44424D] text-[9.62px] mb-4 flex items-center justify-center rounded-[23.48px] h-[36px]">
              <i className="add-package-icon bg-[#44424D] h-[12px] w-[11.5px] mr-1" />
              Add New Package
            </Button>
          </div>
        </DrawerTrigger>
        <DrawerContent className="p-6 max-w-md mx-auto">
          <DrawerHeader className="p-0 mb-8">
            <DrawerClose asChild>
              <div className="flex items-center gap-2 mb-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-[11px] w-[11px] bg-white border-none"
                >
                  <i className="back-icon size-[20.5px]" />
                </Button>
                <span className="text-[11px]">Back</span>
              </div>
            </DrawerClose>
            <DrawerTitle className="text-[14px] text-center justify-center">
              Add new package
            </DrawerTitle>
          </DrawerHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col"
            >
              <FormField
                control={form.control}
                name="package_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#212121] text-[14px]">
                      Package name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter package name"
                        className="p-3 rounded-[10px] border-[#BDBDBD] text-[14px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sessionsAllocated"
                render={({ field }) => (
                  <FormItem className="mt-5">
                    <FormLabel className="text-[#212121] text-[14px]">
                      Sessions allocated
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Add session count"
                        className="p-3 rounded-[10px] border-[#BDBDBD] text-[14px]"
                        type="number"
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          field.onChange(isNaN(value) ? "" : value);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 mt-8 justify-center items-center">
                <DrawerClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-[120px] h-[40px] py-6 border-[#BDBDBD] rounded-[10px]"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </DrawerClose>
                <Button
                  type="submit"
                  className="w-[120px] h-[40px] py-6 border rounded-[10px] bg-[#378644] text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DrawerContent>
      </Drawer>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="w-[313px] h-[207px] rounded-[10px] sm:rounded-[10px] px-1">
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center">
            <div className="p-1 mb-1">
              <i className="correct-icon size-[48] text-[#4CAF50]" />
            </div>
            <h2 className="text-[14px] text-[#757575]">
              New Package Created!
            </h2>
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="w-[280px] h-[39px] mt-5 bg-[#378644] text-white"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewPackage;