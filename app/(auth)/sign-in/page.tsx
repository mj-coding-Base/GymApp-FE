import CardWrapper from "@/components/auth/CardWrapper";
import LoginForm from "@/components/auth/LoginForm";

const LoginPage = () => {
  return (
    <div className="items-center justify-center w-full">
      <CardWrapper
        logo={true}
        label=""
        title="Admin Login"
        backButtonTitle=""
        backButtonHref=""
        backButtonLabel=""
        titleClass=" text-[18px] font-600"
        headerTexts=""
        className="items-center justify-center"
      >
        <LoginForm />
      </CardWrapper>
    </div>

  );
};

export default LoginPage;