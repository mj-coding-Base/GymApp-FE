import CardWrapper from "@/components/auth/CardWrapper";
import LoginForm from "@/components/auth/LoginForm";

const LoginPage = () => {
  return (
    <CardWrapper
      logo={true}
      label=""
      title="Admin Login"
      backButtonTitle=""
      backButtonHref=""
      backButtonLabel=""
      titleClass=" text-[18px] font-600"
      headerTexts=""
      className=""
    >
      <LoginForm />
    </CardWrapper>
  );
};

export default LoginPage;