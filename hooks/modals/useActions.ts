import { CommonResponseDataType } from "@/types/Common";
import { useSuccessModal } from "./useSuccessModal";
import { useWarningModal } from "./useWarningModal";
import { toast } from "sonner";

export const useActions = () => {
  const { setOpenSuccessModal, setSuccessData } = useSuccessModal();

  const { setWarningData, setOpenWarningModal } = useWarningModal();

  const handleAction = async (
    func: () => Promise<CommonResponseDataType>,
    warningText: string,
    successText: string,
    warningButtonText?: string,
    successButtonText?: string,
    cancelFunction?: () => void,
    color?: "red" | "yellow",
    warningDescription?: string,
    successDescription?: string,
    successFunction?: () => void
  ) => {
    setWarningData({
      title: warningText,
      description: warningDescription,
      backButtonText: warningButtonText ?? "Yes",
      function: async () => {
        const response = await func();

        if (response.status === "SUCCESS") {
          setSuccessData({
            title: successText,
            backButtonText: successButtonText ?? "Continue",
            description: successDescription,
            function: () => {},
          });
          setOpenSuccessModal(true);
          if (successFunction) {
            successFunction();
          }
        } else {
          toast(response.message);
        }
      },
      cancelFunction,
      color,
    });

    setOpenWarningModal(true);
  };

  return { handleAction };
};
