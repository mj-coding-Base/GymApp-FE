"use client";

import { updateEquipment, deleteEquipment } from "@/actions/equipment";
import { EquipmentType, EquipmentStatus, UpdateEquipmentDto } from "@/types/Equipment";
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
  equipmentType: z.nativeEnum(EquipmentType).optional(),
  equName: z.string().min(1, "Equipment name is required").optional(),
  model: z.string().optional(),
  brand: z.string().optional(),
  room: z.string().optional(),
  zone: z.string().optional(),
  purchaseDate: z.string().optional(),
  quantityTotal: z.number().min(0).optional(),
  lastServicedAt: z.string().optional(),
  nextServiceDue: z.string().optional(),
  warrantyProvider: z.string().optional(),
  warrantyExpiresAt: z.string().optional(),
  equipmentStatus: z.nativeEnum(EquipmentStatus).optional(),
  cost: z.number().min(0).optional(),
  description: z.string().optional(),
});

interface UpdateEquipmentProps {
  equipmentId: string;
  initialData?: {
    equipmentType: EquipmentType;
    equName: string;
    model?: string;
    brand?: string;
    location?: { room?: string; zone?: string };
    purchaseDate?: string;
    quantityTotal?: number;
    lastServicedAt?: string;
    nextServiceDue?: string;
    warranty?: { provider?: string; expiresAt?: string };
    equipmentStatus: EquipmentStatus;
    cost?: number;
    description?: string;
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
      equipmentType: initialData?.equipmentType,
      equName: initialData?.equName || "",
      model: initialData?.model || "",
      brand: initialData?.brand || "",
      room: initialData?.location?.room || "",
      zone: initialData?.location?.zone || "",
      purchaseDate: initialData?.purchaseDate || "",
      quantityTotal: initialData?.quantityTotal,
      lastServicedAt: initialData?.lastServicedAt || "",
      nextServiceDue: initialData?.nextServiceDue || "",
      warrantyProvider: initialData?.warranty?.provider || "",
      warrantyExpiresAt: initialData?.warranty?.expiresAt || "",
      equipmentStatus: initialData?.equipmentStatus,
      cost: initialData?.cost,
      description: initialData?.description || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof updateEquipmentSchema>) => {
    setIsSubmitting(true);
    try {
      const updateData: UpdateEquipmentDto = {
        equipmentType: values.equipmentType,
        equName: values.equName,
        model: values.model || undefined,
        brand: values.brand || undefined,
        location: values.room || values.zone ? {
          room: values.room || undefined,
          zone: values.zone || undefined,
        } : undefined,
        purchaseDate: values.purchaseDate || undefined,
        quantityTotal: values.quantityTotal || undefined,
        lastServicedAt: values.lastServicedAt || undefined,
        nextServiceDue: values.nextServiceDue || undefined,
        warranty: values.warrantyProvider || values.warrantyExpiresAt ? {
          provider: values.warrantyProvider || undefined,
          expiresAt: values.warrantyExpiresAt || undefined,
        } : undefined,
        equipmentStatus: values.equipmentStatus,
        cost: values.cost || undefined,
        description: values.description || undefined,
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
  const statusOptions = Object.values(EquipmentStatus);

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
                name="equipmentType"
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
                name="equName"
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
                        min="0"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#212121] text-[14px]">
                      Cost
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Cost"
                        className="p-3 rounded-[10px] border-[#BDBDBD] text-[14px]"
                        type="number"
                        min="0"
                        step="0.01"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="equipmentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#212121] text-[14px]">
                      Status
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="p-3 rounded-[10px] border-[#BDBDBD] text-[14px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
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
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#212121] text-[14px]">
                      Purchase Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#212121] text-[14px]">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter description"
                        className="p-3 rounded-[10px] border-[#BDBDBD] text-[14px]"
                        {...field}
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

