import CardWrapper from "@/components/auth/CardWrapper";
import NewPasswordForm from "@/components/auth/NewPasswordForm";
import PasswordSuccessModal from "@/components/auth/PasswordSuccessModal";

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
        <NewPasswordForm />
      </CardWrapper>

      <PasswordSuccessModal />
    </>
  );
};

export default LoginPage;
