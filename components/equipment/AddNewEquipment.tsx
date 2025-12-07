"use client";

import { createNewEquipment } from "@/actions/equipment";
import { EquipmentType, MuscleGroup } from "@/types/Equipment";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Define the form schema
const equipmentSchema = z.object({
  name: z.string().min(1, "Equipment name is required"),
  type: z.nativeEnum(EquipmentType),
  muscleGroups: z.array(z.nativeEnum(MuscleGroup)).min(1, "At least one muscle group is required"),
  model: z.string().min(1, "Model is required"),
  brand: z.string().min(1, "Brand is required"),
  room: z.string().optional(),
  zone: z.string().optional(),
  quantityTotal: z.number().min(1, "Quantity must be at least 1"),
  sku: z.string().optional(),
  serialNumber: z.string().optional(),
  maintenanceIntervalDays: z.number().min(1).optional(),
});

interface AddNewEquipmentProps {
  onEquipmentAdded?: () => void;
}

function AddNewEquipment({ onEquipmentAdded }: AddNewEquipmentProps) {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof equipmentSchema>>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: "",
      type: EquipmentType.UNKNOWN,
      muscleGroups: [MuscleGroup.UNKNOWN],
      model: "",
      brand: "",
      room: "",
      zone: "",
      quantityTotal: 1,
      sku: "",
      serialNumber: "",
      maintenanceIntervalDays: undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof equipmentSchema>) => {
    setIsSubmitting(true);
    try {
      console.log("Form submitted with data:", data);
      
      const equipmentData = {
        name: data.name,
        type: data.type,
        muscleGroups: data.muscleGroups,
        model: data.model,
        brand: data.brand,
        location: {
          room: data.room || undefined,
          zone: data.zone || undefined,
        },
        quantityTotal: data.quantityTotal,
        sku: data.sku || undefined,
        serialNumber: data.serialNumber || undefined,
        maintenanceIntervalDays: data.maintenanceIntervalDays || undefined,
      };

      console.log("Sending equipment data:", equipmentData);
      const result = await createNewEquipment(equipmentData);
      console.log("Equipment creation result:", result);
      
      if (result) {
        toast.success("Equipment created successfully!");
        setShowSuccessDialog(true);
        form.reset();
        onEquipmentAdded?.();
      } else {
        toast.error("Failed to create equipment");
      }
    } catch (error: unknown) {
      console.error("Error creating new equipment:", error);
      const errorMessage = 
        (error && typeof error === 'object' && 'response' in error && 
         error.response && typeof error.response === 'object' && 'data' in error.response &&
         error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
         ? String(error.response.data.message)
         : (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
            ? error.message
            : "An unexpected error occurred"));
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const equipmentTypeOptions = Object.values(EquipmentType);
  const muscleGroupOptions = Object.values(MuscleGroup);

  return (
    <div>
      <Drawer>
        <DrawerTrigger asChild>
          <div className="w-full flex flex-col pl-2 pr-2 mt-3">
            <Button className="bg-[#44424D] text-[9.62px] mb-4 flex items-center justify-center rounded-[23.48px] h-[36px]">
              <i className="add-package-icon bg-[#44424D] h-[12px] w-[11.5px] mr-1" />
              Add New Equipment
            </Button>
          </div>
        </DrawerTrigger>
        <DrawerContent className="flex flex-col max-w-md mx-auto bg-white max-h-[95vh] overflow-hidden">
          <DrawerHeader className="p-6 pb-4 border-b border-[#EBEBEB] flex-shrink-0">
            <DrawerClose asChild>
              <div className="flex items-center gap-2 mb-4 cursor-pointer hover:opacity-70 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-transparent"
                >
                  <i className="back-icon size-5 text-[#4C4E64]" />
                </Button>
                <span className="text-sm text-[#4C4E64] font-medium">Back</span>
              </div>
            </DrawerClose>
            <DrawerTitle className="text-lg font-semibold text-[#212121] text-left">
              Add New Equipment
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit(onSubmit)} 
                className="flex flex-col h-full min-h-0"
              >
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 pb-4">
                  <div className="flex flex-col gap-6">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-[#212121] mb-3">Basic Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#212121] text-sm font-medium">
                              Equipment Name <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter equipment name"
                                className="h-11 rounded-lg border-[#BDBDBD] text-sm focus:ring-2 focus:ring-[#65A28C] focus:border-[#65A28C]"
                                {...field}
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
                            <FormLabel className="text-[#212121] text-sm font-medium">
                              Equipment Type <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                              }} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-11 rounded-lg border-[#BDBDBD] text-sm focus:ring-2 focus:ring-[#65A28C] focus:border-[#65A28C]">
                                  <SelectValue placeholder="Select equipment type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {equipmentTypeOptions.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="muscleGroups"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#212121] text-sm font-medium">
                              Muscle Groups <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                const currentGroups = field.value || [];
                                if (!currentGroups.includes(value as MuscleGroup)) {
                                  field.onChange([...currentGroups, value as MuscleGroup]);
                                }
                              }}
                              value=""
                            >
                              <FormControl>
                                <SelectTrigger className="h-11 rounded-lg border-[#BDBDBD] text-sm focus:ring-2 focus:ring-[#65A28C] focus:border-[#65A28C]">
                                  <SelectValue placeholder="Add muscle group" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {muscleGroupOptions.map((group) => (
                                  <SelectItem key={group} value={group}>
                                    {group.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {field.value && field.value.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {field.value.map((group) => (
                                  <span
                                    key={group}
                                    className="inline-flex items-center px-2 py-1 rounded-md bg-[#65A28C] text-white text-xs"
                                  >
                                    {group.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        field.onChange(field.value.filter(g => g !== group));
                                      }}
                                      className="ml-2 hover:text-red-200"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="brand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#212121] text-sm font-medium">
                                Brand <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Brand name"
                                  className="h-11 rounded-lg border-[#BDBDBD] text-sm focus:ring-2 focus:ring-[#65A28C] focus:border-[#65A28C]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="model"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#212121] text-sm font-medium">
                                Model <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Model number"
                                  className="h-11 rounded-lg border-[#BDBDBD] text-sm focus:ring-2 focus:ring-[#65A28C] focus:border-[#65A28C]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Location & Status Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-[#212121] mb-3">Location & Status</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="room"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#212121] text-sm font-medium">
                                Room
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Room number"
                                  className="h-11 rounded-lg border-[#BDBDBD] text-sm focus:ring-2 focus:ring-[#65A28C] focus:border-[#65A28C]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="zone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#212121] text-sm font-medium">
                                Zone
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Zone/Area"
                                  className="h-11 rounded-lg border-[#BDBDBD] text-sm focus:ring-2 focus:ring-[#65A28C] focus:border-[#65A28C]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="quantityTotal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#212121] text-sm font-medium">
                              Quantity <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="1"
                                className="h-11 rounded-lg border-[#BDBDBD] text-sm focus:ring-2 focus:ring-[#65A28C] focus:border-[#65A28C]"
                                type="number"
                                min="1"
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Additional Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-[#212121] mb-3">Additional Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#212121] text-sm font-medium">
                              SKU
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Stock Keeping Unit"
                                className="h-11 rounded-lg border-[#BDBDBD] text-sm focus:ring-2 focus:ring-[#65A28C] focus:border-[#65A28C]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="serialNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#212121] text-sm font-medium">
                              Serial Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Serial number"
                                className="h-11 rounded-lg border-[#BDBDBD] text-sm focus:ring-2 focus:ring-[#65A28C] focus:border-[#65A28C]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maintenanceIntervalDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#212121] text-sm font-medium">
                              Maintenance Interval (Days)
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., 30, 60, 90"
                                className="h-11 rounded-lg border-[#BDBDBD] text-sm focus:ring-2 focus:ring-[#65A28C] focus:border-[#65A28C]"
                                type="number"
                                min="1"
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Always visible at bottom */}
                <div className="flex-shrink-0 flex gap-4 px-6 py-4 border-t border-[#EBEBEB] bg-white justify-end items-center">
                <DrawerClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-w-[120px] h-11 border-[#BDBDBD] rounded-lg text-sm font-medium hover:bg-[#F5F5F5] transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </DrawerClose>
                <Button
                  type="submit"
                  className="min-w-[120px] h-11 rounded-lg bg-[#65A28C] hover:bg-[#5a8f7a] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Equipment"
                  )}
                </Button>
              </div>
            </form>
          </Form>
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="w-[313px] h-[207px] rounded-[10px] sm:rounded-[10px] px-1">
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
            <DialogDescription>
              Equipment has been created successfully
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center">
            <div className="p-1 mb-1">
              <i className="correct-icon size-[48] text-[#4CAF50]" />
            </div>
            <h2 className="text-[14px] text-[#757575]">
              New Equipment Created!
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

export default AddNewEquipment;

