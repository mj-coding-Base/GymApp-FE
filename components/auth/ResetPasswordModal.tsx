/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
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

import { cn } from "@/lib/utils";

const formSchema = z
  .object({
    currentPassword: z
      .string({
        required_error: "Current password is required.",
      })
      .min(8, {
        message: "Current password should be at least 8 characters.",
      }),
    newPassword: z
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
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const ResetPasswordModal = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  const action: () => void = form.handleSubmit(onSubmit);

  const handleClose = () => {
    form.reset((prev: any) => {
      Object.keys(prev).forEach((key) => (prev[key] = undefined));

      return { ...prev };
    });
  };

  return (
    <Dialog onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <p className="font-normal text-[15px] text-[#007AFF] text-start">
          Change Password
        </p>
      </DialogTrigger>
      <DialogContent className="p-[25px] w-[500px] h-fit max-w-full rounded-[15px] max-sm:w-[500px]">
        <Form {...form}>
          <form action={action} className="space-y-[20px] w-full">
            <div className=" flex flex-col gap-[20px]">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-0">
                    <FormLabel className="text-sm font-normal text-[#212121] w-full p-0">
                      Current Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Type"
                          className={cn(
                            "h-[59px] text-sm font-normal w-full rounded-[10px] px-5 py-2.5",
                            field.value
                              ? "border-[#616161]"
                              : "border-[#E0E0E0]"
                          )}
                        />

                        {showPassword ? (
                          <i
                            onClick={() => setShowPassword(!showPassword)}
                            className="password-show size-6 shrink-0 absolute right-[20px] top-[14px] cursor-pointer text-[#B1B1B1]"
                          />
                        ) : (
                          <i
                            onClick={() => setShowPassword(!showPassword)}
                            className="password-closed size-6 absolute right-[20px] top-[14px] cursor-pointer text-[#B1B1B1]"
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-0">
                    <FormLabel className="text-sm font-normal text-[#212121] w-full p-0">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Type"
                          className={cn(
                            "h-[59px] text-sm font-normal w-full rounded-[10px] px-5 py-2.5",
                            field.value
                              ? "border-[#616161]"
                              : "border-[#E0E0E0]"
                          )}
                        />

                        {showNewPassword ? (
                          <i
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="password-show size-6 shrink-0 absolute right-[20px] top-[14px] cursor-pointer text-[#B1B1B1]"
                          />
                        ) : (
                          <i
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="password-closed size-6 absolute right-[20px] top-[14px] cursor-pointer text-[#B1B1B1]"
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-0">
                    <FormLabel className="text-sm font-normal text-[#212121] w-full p-0">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Type"
                          className={cn(
                            "h-[59px] text-sm font-normal w-full rounded-[10px] px-5 py-2.5",
                            field.value
                              ? "border-[#616161]"
                              : "border-[#E0E0E0]"
                          )}
                          onChange={(e) => {
                            if (
                              e.target.value !== form.getValues("newPassword")
                            ) {
                              form.setError("confirmPassword", {
                                type: "manual",
                                message: "Passwords do not match",
                              });
                            } else {
                              form.clearErrors("confirmPassword");
                            }

                            form.setValue("confirmPassword", e.target.value);
                          }}
                        />

                        {showConfirmPassword ? (
                          <i
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="password-show size-6 shrink-0 absolute right-[20px] top-[14px] cursor-pointer text-[#B1B1B1]"
                          />
                        ) : (
                          <i
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="password-closed size-6 absolute right-[20px] top-[14px] cursor-pointer text-[#B1B1B1]"
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <span className="flex flex-row float-right gap-[15px]">
              <DialogClose>
                <Button
                  type="button"
                  className="w-[110px] rounded-[8px] font-semibold text-[16px] h-[45px] bg-white text-[#616161] border-[#616161] border-[1.5px]"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-[110px] rounded-[8px] font-semibold text-[16px] h-[45px] bg-[#003A02]"
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </span>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordModal;
