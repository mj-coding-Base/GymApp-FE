import CardWrapper from "@/components/auth/CardWrapper";
import NewPasswordForm from "@/components/auth/NewPasswordForm";
import PasswordSuccessModal from "@/components/auth/PasswordSuccessModal";
import { Suspense } from "react";

const LoginPage = () => {
  return (
    <>
      <CardWrapper
        logo={false}
        label="Add new Password to proceed."
        title="Set New Password"
        backButtonTitle=""
        backButtonHref=""
        backButtonLabel=""
        titleClass="text-[18px]/[22px] font-semibold"
        headerTexts=""
        className=""
      >
        <Suspense fallback={<div>Loading...</div>}>
          <NewPasswordForm />
        </Suspense>
      </CardWrapper>

      <PasswordSuccessModal />
    </>
  );
};

export default LoginPage;
