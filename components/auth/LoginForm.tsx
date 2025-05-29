"use client";

import React, { useState } from "react";
import Link from "next/link";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useSecureCredentials } from "@/hooks/useSecureCredentials";
import { login } from "@/lib/authentication";
import { SuccessToast } from "../common/toast";
import Loading from "./Loading";

const formSchema = z.object({
  email: z
    .string({
      required_error: "Please enter a valid email address",
    })
    .email({
      message: "Please enter a valid email address.",
    }),
  password: z
    .string({
      required_error: "Password is required.",
    })
    .min(4, {
      message: "Password should be at least 8 characters.",
    }),
});

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { isRemembered, setIsRemembered } = useSecureCredentials();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    const res = await login({ ...values, rememberMe: isRemembered });

    if (res.status === "FAIL") {
      setLoading(false);
      form.setError("email", {
        type: "manual",
        message: res.message ?? "Something went wrong. Please try again.",
      });

      return;
    }

    SuccessToast("Logged in successfully.");

    router.prefetch("/");

    router.push("/");
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const action: () => void = form.handleSubmit(onSubmit);

  return (
    <Form {...form}>
      <form
        action={action}
        className="flex flex-col justify-between h-full gap-[68px]"
      >
        <div className="flex flex-col gap-[15px]">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                {form.formState.errors.email?.message && (
                  <div className="text-[10.5px] h-max border-2 border-[#FF5252] bg-[#FF52521A] px-[10px] py-[10px] rounded-[15px] mb-[25px] text-[#FF5252] flex items-center">
                    <i className="danger-icon size-6 mr-2.5 shrink-0" />
                    {form.formState.errors.email?.message}
                  </div>
                )}
                <div className="flex h-[54px] w-full rounded-[10px] px-[20px] border-[1.5px] group focus-within:border-[#2D3B64]">
                  <span className="flex flex-col gap-0 h-max my-auto w-full">
                    <FormLabel className="text-[12px] font-normal text-[#9E9E9E] w-full">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Your Registered Email"
                        {...field}
                        className="text-[12px] placeholder:text-[12px] focus:outline-transparent outline-none p-0 m-0 py-0 focus-visible:ring-0 focus-visible:ring-offset-0 border-none h-max text-[#616161] w-full rounded-none"
                        type="email"
                      />
                    </FormControl>
                  </span>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="focus:outline-transparent flex h-[54px] w-full rounded-[10px] px-[20px] border-[1.5px] group focus-within:border-[#2D3B64]">
                  <div className="flex flex-row items-center justify-between w-full">
                    <span className="flex flex-col gap-0 h-max my-auto w-full">
                      <FormLabel className="text-xs font-normal text-[#9E9E9E] w-full">
                        Password
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
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="w-full flex items-center justify-between gap-5">
            <div className="flex flex-row items-center justify-center gap-2.5">
              <Checkbox
                id="terms1"
                className="size-4 border-none"
                checked={isRemembered}
                onCheckedChange={(checked) => setIsRemembered(Boolean(checked))}
                style={{
                  backgroundColor: "#4CAF50", // Green background
                  borderColor: "#4CAF50",
                }}
              />
              <label
                htmlFor="terms1"
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black"
              >
                Remember Password
              </label>
            </div>

            <Link href="/reset-password" className="text-sm text-[#00BC15]">
              Forgot Password?
            </Link>
          </div>
        </div>
        <Button
          type="submit"
          disabled={loading || !form.watch().email || !form.watch().password}
          className="w-full rounded-[10px] font-semibold text-lg h-[42px] bg-[#00BC15] text-white"
        >
          Login
        </Button>
      </form>
      <Loading open={form.formState.isSubmitting} />
    </Form>
  );
};

export default LoginForm;
