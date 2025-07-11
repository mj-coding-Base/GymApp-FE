import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useMarkAttendanceGroupSheet } from "@/hooks/useMarkAttendanceGroupSheet";
import { getAllSessions, markGroupAttendance } from "@/actions/session";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

// interface AttendanceResponse {
//   status: "SUCCESS" | "FAIL";
//   message: string;
// }

const FormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
});

const MarkAttendanceGroup = () => {
  type SessionItem = {
    id: string;
    name: string;
  };
  
  const [items, setItems] = React.useState<SessionItem[]>([]);
  const { openMarkAttendanceGroupSheet, setOpenMarkAttendanceGroupSheet } = 
    useMarkAttendanceGroupSheet();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      items: [],
    },
  });

  React.useEffect(() => {
    const fetchSessions = async () => {
      try {
        // const sessions = await getAllSessions();
        setItems(sessions.data.map(session => ({
          id: session._id ?? "",
          name: `Session ${new Date(session.createdAt ?? "").toLocaleDateString()}`,
        })));
      } catch (error) {
         toast.error(error instanceof Error ? error.message :"Failed to load sessions");
      }
    };

    fetchSessions();
  }, []);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const result = await markGroupAttendance(data.items);
      
      if (result.status === "SUCCESS") {
        toast.success(result.message);
        setOpenMarkAttendanceGroupSheet(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message :"An error occurred while marking attendance");
      console.log(error);
      }
  }

  return (
    <Sheet
      open={openMarkAttendanceGroupSheet}
      onOpenChange={setOpenMarkAttendanceGroupSheet}
    >
      <SheetContent
        side="bottom"
        className="rounded-t-2xl min-h-120 max-h-[calc(100%-40px)]"
      >
        <SheetHeader className="gap-5">
          <SheetTitle className="text-[14px] font-semibold text-[#363636]">
            Mark Attendance for Group
          </SheetTitle>
          <SheetDescription className="relative w-full max-w-sm">
            <i className="search-icon w-[16.54px] h-[18.9px] text-[#000000] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search by Full name/ NIC"
              className="pl-10 text-[11px] font-normal text-[#4F4F4F]"
            />
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="items"
                render={() => (
                  <FormItem className="gap-0 border-[#E7E7E7] border-[1px] rounded-[16px] overflow-hidden">
                    {items.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="items"
                        render={({ field }) => {
                          const handleChecked = () => {
                            field.onChange([...field.value, item.id]);
                          };

                          const handleUnchecked = () => {
                            field.onChange(
                              field.value?.filter(
                                (value) => value !== item.id
                              )
                            );
                          };

                          const handleCheckboxChange = (checked: boolean) => {
                            if (checked) {
                              handleChecked();
                            } else {
                              handleUnchecked();
                            }
                          };

                          return (
                            <FormItem className="flex flex-row items-center justify-between space-y-0 p-[11px] border-b-[#E2EBF7] border-b-[0.73px]">
                              <FormLabel className="text-[11px] text-[#4F4F4F] font-normal">
                                {item.name}
                              </FormLabel>
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => 
                                    handleCheckboxChange(!!checked)
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <SheetFooter className="grid grid-cols-2 gap-[15px]">
          <SheetClose asChild>
            <Button
              variant={"outline"}
              className="border-[#69716C] rounded-[10px] text-[13px] font-semibold text-[#69716C] h-[40px]"
            >
              Cancel
            </Button>
          </SheetClose>
          <Button
            type="submit"
            onClick={() => form.handleSubmit(onSubmit)()}
            className="bg-[#378644] rounded-[10px] text-[13px] font-semibold text-[#FFFFFF] h-[40px]"
          >
            Mark Attendance
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default MarkAttendanceGroup;