import { toast } from "sonner";

export const SuccessToast = (title: string) =>
  toast.custom(() => (
    <div className="flex flex-row items-center gap-2.5 lg:gap-[7.5px] 3xl:!gap-2.5 bg-[#3D3D3D] p-5 lg:p-[15px] 3xl:!p-4 rounded-[10px] lg:rounded-[7.5px] 3xl:!rounded-[10px]">
      <i className="size-6 lg:size-[18px] 3xl:!size-6 success-icon text-[#E8F3E3] shrink-0" />
      <p className="text-sm 3xl:!text-base font-semibold text-[#E8F3E3]">
        {title}
      </p>
    </div>
  ));

export const ErrorToast = (title: string) =>
  toast.custom(() => (
    <div className="flex flex-row items-center gap-2.5 lg:gap-[7.5px] 3xl:!gap-2.5 bg-[#3D3D3D] p-5 lg:p-[15px] 3xl:!p-4 rounded-[10px] lg:rounded-[7.5px] 3xl:!rounded-[10px] max-w-full w-full">
      <i className="size-6 lg:size-[18px] 3xl:!size-6 error-icon text-[#E8F3E3] shrink-0" />
      <p className="text-sm 3xl:!text-base font-semibold text-[#E8F3E3] w-full">
        {title}
      </p>
    </div>
  ));
