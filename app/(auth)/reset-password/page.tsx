"use client";

import { useState } from "react";

import CardWrapper from "@/components/auth/CardWrapper";
import CheckEmail from "@/components/auth/CheckEmail";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

import Loading from "@/components/auth/Loading";
import { Button } from "@/components/ui/button";

const ResetPassword = () => {
  const [showCheckEmail, setShowCheckEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setShowCheckEmail(true);
  };

  const handleResend = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setLoading(false);
  };

  return (
    <div className="flex flex-col">
      <CardWrapper
        logo={false}
        label={
          showCheckEmail
            ? `You will receive a link to ${email} and it will provide the instructions to reset the password.`
            : "Reset password by providing your registered email address."
        }
        title={showCheckEmail ? `Check Your Email` : "Reset Password"}
        backButtonTitle=""
        backButtonHref=""
        backButtonLabel=""
        titleClass="text-[18px]/[22px] font-semibold"
        headerTexts=""
        className={showCheckEmail ? "" : ""}
        showCheckEmail={showCheckEmail}
        setShowCheckEmail={setShowCheckEmail}
      >
        {showCheckEmail ? (
          <div className="flex flex-col h-full justify-between">
            <CheckEmail />
            <Button
              disabled={loading}
              onClick={handleResend}
              className="w-full rounded-[10px] font-semibold text-lg h-[42px] text-white bg-[#F04237]"
            >
              Resend
            </Button>
            <Loading open={loading} />
          </div>
        ) : (
          <ResetPasswordForm onNext={handleNext} setEmail={setEmail} />
        )}
      </CardWrapper>
    </div>
  );
};

export default ResetPassword;
