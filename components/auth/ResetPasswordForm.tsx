"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { forgotPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Loading from "./Loading";

const formSchema = z.object({
  email: z
    .string({
      required_error: "Please enter your email address.",
    })
    .email({
      message: "Please enter a valid email address.",
    }),
});

interface ResetPasswordFormProps {
  onNext: () => void;
  setEmail: (email: string) => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onNext,
  setEmail,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const res = await forgotPassword(values.email);

    if (res.status === "FAIL") {
      form.setError("email", {
        type: "manual",
        message: res.message,
      });

      return;
    }

    setEmail(values.email);
    onNext();
  };

  const action: () => void = form.handleSubmit(onSubmit);

  return (
    <Form {...form}>
      <form action={action} className="flex flex-col justify-between h-full">
        <div className="flex flex-col gap-[15px]">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                {form.formState.errors.email?.message && (
                  <div className="text-[14px] h-max border-2 border-[#FF5252] bg-[#FF52521A] px-[10px] py-[12.5px] rounded-[15px] mb-[25px] text-[#FF5252] flex">
                    <i className="danger-icon size-6 mr-2.5 shrink-0" />
                    {form.formState.errors.email?.message}
                  </div>
                )}
                <div className="flex h-[59px] w-full rounded-[10px] px-[20px] border-[1.5px] group focus-within:border-[#2D3B64]">
                  <span className="flex flex-col gap-0 h-max my-auto w-full">
                    <FormLabel className="text-xs font-normal text-[#9E9E9E] w-full">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your registered email"
                        {...field}
                        className="focus:outline-transparent outline-none p-0 m-0 py-0 focus-visible:ring-0 focus-visible:ring-offset-0 border-none h-max font-normal text-sm text-[#616161] w-full rounded-none"
                      />
                    </FormControl>
                  </span>
                </div>
              </FormItem>
            )}
          />
        </div>
        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="w-full rounded-[10px] font-semibold text-lg h-[42px] text-white bg-[#F04237]"
        >
          Next
        </Button>
      </form>

      <Loading open={form.formState.isSubmitting} />
    </Form>
  );
};

export default ResetPasswordForm;
