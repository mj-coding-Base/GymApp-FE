"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { resetPassword } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { SuccessToast } from "../common/toast";
import Loading from "./Loading";

const formSchema = z
  .object({
    password: z
      .string({
        required_error: "New password is required.",
      })
      .min(8, {
        message: "New password should be at least 8 characters.",
      })
      .max(16, {
        message: "New password should be at most 16 characters.",
      })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[ -\/:-@\[-`{-~])[A-Za-z\d -\/:-@\[-`{-~]{8,14}$/,
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.",
        }
      ),
    confirmPassword: z
      .string({
        required_error: "Confirm password is required.",
      })
      .min(8, {
        message: "Confirm password should be at least 8 characters.",
      })
      .max(16, {
        message: "Confirm password should be at most 16 characters.",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const NewPasswordForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const searchparams = useSearchParams();
  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const token = searchparams.get("token");

    if (!token) {
      form.setError("password", {
        type: "manual",
        message: "Invalid token",
      });

      return;
    }

    const res = await resetPassword({
      token,
      newPassword: values.password,
    });

    if (res.status === "FAIL") {
      form.setError("password", {
        type: "manual",
        message: res.message,
      });

      return;
    }

    SuccessToast("Password Changed Successfully");

    router.push("/sign-in");
  };

  const action: () => void = form.handleSubmit(onSubmit);

  return (
    <Form {...form}>
      <form
        action={action}
        className="flex flex-col justify-between h-full gap-[68px]"
      >
        <div className="flex flex-col gap-[35px]">
          <div className=" flex flex-col gap-[15px]">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="focus:outline-transparent flex h-[59px] w-full rounded-[10px] px-[20px] border-[1.5px] group focus-within:border-[#2D3B64]">
                    <div className="flex flex-row items-center justify-between w-full">
                      <span className="flex flex-col gap-0 h-max my-auto w-full">
                        <FormLabel className="text-xs font-normal text-[#9E9E9E] w-full">
                          New Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="******************"
                            {...field}
                            className="focus:outline-transparent peer p-0 m-0 py-0 focus-visible:ring-0 focus-visible:ring-offset-0 border-none h-max font-normal text-sm text-[#616161] w-full rounded-none"
                            type={showPassword ? "text" : "password"}
                          />
                        </FormControl>
                      </span>
                      <i
                        onClick={() => setShowPassword(!showPassword)}
                        className={cn(
                          "password-closed-icon w-[20px] h-[20px] text-[#B1B1B1] cursor-pointer",
                          showPassword && "password-show"
                        )}
                      />
                    </div>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <div className="focus:outline-transparent flex h-[59px] w-full rounded-[10px] px-[20px] border-[1.5px] group focus-within:border-[#2D3B64]">
                    <div className="flex flex-row items-center justify-between w-full">
                      <span className="flex flex-col gap-0 h-max my-auto w-full">
                        <FormLabel className="text-xs font-normal text-[#9E9E9E] w-full">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="******************"
                            {...field}
                            className="focus:outline-transparent peer p-0 m-0 py-0 focus-visible:ring-0 focus-visible:ring-offset-0 border-none h-max font-normal text-sm text-[#616161] w-full rounded-none"
                            type={showConfirmPassword ? "text" : "password"}
                          />
                        </FormControl>
                      </span>
                      <i
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className={cn(
                          "password-closed-icon w-[20px] h-[20px] text-[#B1B1B1] cursor-pointer",
                          showConfirmPassword && "password-show"
                        )}
                      />
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="text-xs lg:text-sm font-normal text-[#535353]">
              Password should contain:
            </span>
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-[15px]">
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px]/[11.75px] lg:text-xs font-normal text-[#999999]">
                  Minimum Length: 8 characters
                </span>
                <i
                  className={cn(
                    "round-check size-[17px] text-[#999999] shrink-0",
                    form.watch().password &&
                      form.watch().password.length >= 8 &&
                      "text-[#34C759]"
                  )}
                />
              </div>

              <div className="flex items-center justify-between w-full">
                <span className="text-[10px]/[11.75px] lg:text-xs font-normal text-[#999999]">
                  Letters: At least 1
                </span>
                <i
                  className={cn(
                    "round-check size-[17px] text-[#999999] shrink-0",
                    form.watch().password &&
                      /[a-z]/.test(form.watch().password) &&
                      "text-[#34C759]"
                  )}
                />
              </div>

              <div className="flex items-center justify-between w-full">
                <span className="text-[10px]/[11.75px] lg:text-xs font-normal text-[#999999]">
                  Maximum 16 characters
                </span>
                <i
                  className={cn(
                    "round-check size-[17px] text-[#999999] shrink-0",
                    form.watch().password &&
                      form.watch().password.length <= 16 &&
                      "text-[#34C759]"
                  )}
                />
              </div>

              <div className="flex items-center justify-between w-full">
                <span className="text-[10px]/[11.75px] lg:text-xs font-normal text-[#999999]">
                  Numbers: At least 1
                </span>
                <i
                  className={cn(
                    "round-check size-[17px] text-[#999999]",
                    form.watch().password &&
                      /[0-9]/.test(form.watch().password) &&
                      "text-[#34C759]"
                  )}
                />
              </div>

              <div className="flex items-center justify-between w-full col-span-2">
                <span className="text-[10px]/[11.75px] lg:text-xs font-normal text-[#999999]">
                  Special Characters: At least 1 (e.g., !@#$%^&*)
                </span>
                <i
                  className={cn(
                    "round-check size-[17px] text-[#999999] shrink-0",
                    form.watch().password &&
                      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
                        form.watch().password
                      ) &&
                      "text-[#34C759]"
                  )}
                />
              </div>
            </div>
          </div>
        </div>
        <Button
          disabled={
            form.formState.isSubmitting ||
            !form.getValues().password ||
            !form.getValues().confirmPassword
          }
          type="submit"
          className="w-full rounded-[10px] font-semibold text-lg h-[42px] text-white bg-[#F04237]"
        >
          Next
        </Button>
        <Loading open={form.formState.isSubmitting} />
      </form>
    </Form>
  );
};

export default NewPasswordForm;
