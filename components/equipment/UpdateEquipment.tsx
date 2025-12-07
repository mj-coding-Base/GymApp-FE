"use client";

import { updateEquipment, deleteEquipment } from "@/actions/equipment";
import { EquipmentType, MuscleGroup, UpdateEquipmentDto } from "@/types/Equipment";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const updateEquipmentSchema = z.object({
  name: z.string().min(1, "Equipment name is required").optional(),
  type: z.nativeEnum(EquipmentType).optional(),
  muscleGroups: z.array(z.nativeEnum(MuscleGroup)).optional(),
  model: z.string().optional(),
  brand: z.string().optional(),
  room: z.string().optional(),
  zone: z.string().optional(),
  quantityTotal: z.number().min(1).optional(),
  sku: z.string().optional(),
  serialNumber: z.string().optional(),
  maintenanceIntervalDays: z.number().min(1).optional(),
});

interface UpdateEquipmentProps {
  equipmentId: string;
  initialData?: {
    name?: string;
    type?: EquipmentType;
    muscleGroups?: MuscleGroup[];
    model?: string;
    brand?: string;
    location?: { room?: string; zone?: string };
    quantityTotal?: number;
    sku?: string;
    serialNumber?: string;
    maintenanceIntervalDays?: number;
  };
  onEquipmentUpdated?: () => void;
}

function UpdateEquipment({ equipmentId, initialData, onEquipmentUpdated }: UpdateEquipmentProps) {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<z.infer<typeof updateEquipmentSchema>>({
    resolver: zodResolver(updateEquipmentSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type,
      muscleGroups: initialData?.muscleGroups || [],
      model: initialData?.model || "",
      brand: initialData?.brand || "",
      room: initialData?.location?.room || "",
      zone: initialData?.location?.zone || "",
      quantityTotal: initialData?.quantityTotal,
      sku: initialData?.sku || "",
      serialNumber: initialData?.serialNumber || "",
      maintenanceIntervalDays: initialData?.maintenanceIntervalDays,
    },
  });

  const onSubmit = async (values: z.infer<typeof updateEquipmentSchema>) => {
    setIsSubmitting(true);
    try {
      const updateData: UpdateEquipmentDto = {
        name: values.name,
        type: values.type,
        muscleGroups: values.muscleGroups && values.muscleGroups.length > 0 ? values.muscleGroups : undefined,
        model: values.model || undefined,
        brand: values.brand || undefined,
        location: values.room || values.zone ? {
          room: values.room || undefined,
          zone: values.zone || undefined,
        } : undefined,
        quantityTotal: values.quantityTotal || undefined,
        sku: values.sku || undefined,
        serialNumber: values.serialNumber || undefined,
        maintenanceIntervalDays: values.maintenanceIntervalDays || undefined,
      };

      const result = await updateEquipment(equipmentId, updateData);

      if (result.status === "SUCCESS") {
        setShowSuccessDialog(true);
        onEquipmentUpdated?.();
      } else {
        toast.error(result.message || "Failed to update equipment");
      }
    } catch (error) {
      console.error("Update equipment failed:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this equipment?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteEquipment(equipmentId);
      toast.success("Equipment deleted successfully");
      onEquipmentUpdated?.();
    } catch (error) {
      console.error("Delete equipment failed:", error);
      toast.error("Failed to delete equipment");
    } finally {
      setIsDeleting(false);
    }
  };

  const equipmentTypeOptions = Object.values(EquipmentType);
  const muscleGroupOptions = Object.values(MuscleGroup);

  return (
    <div>
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="h-[20px] w-[20px]"
          >
            <i className="edit-new-icon bg-[#44424D] h-[14.4px] w-[14.4px] rounded-full" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="p-6 max-w-md mx-auto max-h-[90vh] overflow-y-auto">
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
              Update Equipment
            </DrawerTitle>
          </DrawerHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#212121] text-[14px]">
                      Equipment Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter equipment name"
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#212121] text-[14px]">
                      Equipment Type
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="p-3 rounded-[10px] border-[#BDBDBD] text-[14px]">
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
                    <FormLabel className="text-[#212121] text-[14px]">
                      Muscle Groups
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
                        <SelectTrigger className="p-3 rounded-[10px] border-[#BDBDBD] text-[14px]">
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
                                field.onChange((field.value || []).filter(g => g !== group));
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

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#212121] text-[14px]">
                      Model
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter model"
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
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#212121] text-[14px]">
                      Brand
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter brand"
                        className="p-3 rounded-[10px] border-[#BDBDBD] text-[14px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="room"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#212121] text-[14px]">
                        Room
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Room"
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
                  name="zone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#212121] text-[14px]">
                        Zone
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Zone"
                          className="p-3 rounded-[10px] border-[#BDBDBD] text-[14px]"
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
                    <FormLabel className="text-[#212121] text-[14px]">
                      Quantity
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Quantity"
                        className="p-3 rounded-[10px] border-[#BDBDBD] text-[14px]"
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

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#212121] text-[14px]">
                      SKU
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="SKU"
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
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#212121] text-[14px]">
                      Serial Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Serial Number"
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
                name="maintenanceIntervalDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#212121] text-[14px]">
                      Maintenance Interval (Days)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 30, 60, 90"
                        className="p-3 rounded-[10px] border-[#BDBDBD] text-[14px]"
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

              <div className="flex gap-4 mt-8 justify-center items-center">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-[120px] h-[40px] py-6 rounded-[10px]"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
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
                    "Update"
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
            <DialogTitle>Success</DialogTitle>
            <DialogDescription>
              Equipment has been updated successfully
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center">
            <div className="p-1 mb-1">
              <i className="correct-icon size-[48] text-[#4CAF50]" />
            </div>
            <h2 className="text-[14px] text-[#757575]">
              Equipment Updated!
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

export default UpdateEquipment;
