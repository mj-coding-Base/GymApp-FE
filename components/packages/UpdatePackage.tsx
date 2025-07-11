"use client";

import { updatePackage } from "@/actions/package";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

// Define the form schema to match the API interface
const updatePackageSchema = z.object({
  name: z.string().min(1, "Package name is required"),
  description: z.string().min(1, "Description is required"),
  sessions: z.number().min(1, "Sessions must be at least 1"),
  durationDays: z.number().min(1, "Duration must be at least 1 day"),
  price: z.number().min(0, "Price cannot be negative"),
});

interface UpdatePackageProps {
  packageId: string;
  initialData?: {
    name: string;
    description: string;
    sessions: number;
    durationDays: number;
    price: number;
  };
  onPackageUpdated?: () => void;
}

function UpdatePackage({ packageId, initialData, onPackageUpdated }: UpdatePackageProps) {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with initial data if provided
  const form = useForm<z.infer<typeof updatePackageSchema>>({
    resolver: zodResolver(updatePackageSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      sessions: initialData?.sessions ?? 0,
      durationDays: initialData?.durationDays ?? 0,
      price: initialData?.price ?? 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof updatePackageSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await updatePackage(packageId, {
        name: values.name,
        description: values.description,
        sessions: values.sessions,
        durationDays: values.durationDays,
        price: values.price,
      });

      if (result.status === "SUCCESS") {
        setShowSuccessDialog(true);
        onPackageUpdated?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Update package failed:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Drawer>
        <DrawerTrigger asChild>
          <button className="absolute right-0 top-1/2 -translate-y-1/2 w-[35px] h-[50px] bg-gray-100 rounded-tl-[30px] rounded-bl-[30px] flex items-center justify-center">
            <i className="edit-icon size-[20.5px]" />
          </button>
        </DrawerTrigger>
        <DrawerContent className="p-6 max-w-md mx-auto">
          <DrawerHeader className="p-0 mb-8">
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
            <DrawerTitle className="text-[14px] text-center justify-center">
              Update package
            </DrawerTitle>
          </DrawerHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-[14px]">
                      Package name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter package name"
                        className="p-3 rounded-[10px] border text-[14px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[12px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-[14px]">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter package description"
                        className="p-3 rounded-[10px] border text-[14px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[12px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sessions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-[14px]">
                      Sessions allocated
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Number of sessions"
                        className="p-3 rounded-[10px] border text-[14px]"
                        type="number"
                        min="1"
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage className="text-[12px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="durationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-[14px]">
                      Duration (days)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Duration in days"
                        className="p-3 rounded-[10px] border text-[14px]"
                        type="number"
                        min="1"
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage className="text-[12px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-[14px]">
                      Price
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Package price"
                        className="p-3 rounded-[10px] border text-[14px]"
                        type="number"
                        min="0"
                        step="0.01"
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage className="text-[12px]" />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 mt-8">
                <DrawerClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-[#69716C] rounded-[10px] h-[40px]"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </DrawerClose>
                <Button
                  type="submit"
                  className="flex-1 border rounded-[10px] bg-[#378644] h-[40px] text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DrawerContent>
      </Drawer>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="w-[313px] h-[207px] rounded-[10px] sm:rounded-[10px] px-1">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="p-1 mb-0">
              <i className="correct-icon size-[48] text-[#4CAF50]" />
            </div>
            <h2 className="text-[14px] mt-0 text-[#757575]">
              Package Updated!
            </h2>
            <p className="flex items-center justify-center text-[13px] text-[#757575]">
              The package details has been successfully updated!
            </p>
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                form.reset();
              }}
              className="w-[280px] h-[39px] mt-1 bg-[#378644] text-white"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UpdatePackage;