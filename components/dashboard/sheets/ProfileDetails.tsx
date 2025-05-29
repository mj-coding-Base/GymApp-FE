import ProfileImageUpload from "@/components/common/navbar/ProfileImageUpload";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useProfileDetailsSheet } from "@/hooks/useProfileSheet";
import React from "react";

const ProfileDetails = () => {
  // const session = useSession();
  const { openProfileDetailsSheet, setOpenProfileDetailsSheet } =
    useProfileDetailsSheet();

  return (
    <Sheet
      open={openProfileDetailsSheet}
      onOpenChange={setOpenProfileDetailsSheet}
    >
      <SheetContent
        side="bottom"
        className="rounded-t-2xl min-h-[600px] max-h-[calc(100%-40px)]"
      >
        <SheetHeader>
          <SheetTitle className="text-[14px] font-semibold text-[#363636] flex items-center">
            <i className="back-icon w-4 h-4 text-black" />
            <p className="ml-[5px] text-[11.2px]/[100%] text-[#212121] font-medium">
              Back
            </p>
          </SheetTitle>
        </SheetHeader>
        <div className="px-5 flex flex-col overflow-y-auto gap-[15px]">
          <p className="text-[14px]/[100%] font-medium text-[#3D3D3D] text-center pb-[15px]">
            Admin Profile
          </p>
          <ProfileImageUpload imgURL={"/images/profile-image.png"} />
          <div>
            <p className="text-[12px]/[100%] font-semibold text-[#2A2A2A]">
              Full Name
            </p>
            <p className="mt-[8px] text-[14px]/[100%] font-normal text-[#616161]">
              {/* {session?.user.name} */}
            </p>
          </div>
          <div className="border-b-[#E7E7E7] border-b-[0.8px]"></div>
          <div>
            <p className="text-[12px]/[100%] font-semibold text-[#2A2A2A]">
              Mobile
            </p>
            <p className="mt-[8px] text-[14px]/[100%] font-normal text-[#616161]">
              {/* {session?.user.email} */}
            </p>
          </div>
          <div className="border-b-[#E7E7E7] border-b-[0.8px]"></div>
          <div>
            <p className="text-[12px]/[100%] font-semibold text-[#2A2A2A]">
              {}
            </p>
            <p className="mt-[8px] text-[14px]/[100%] font-normal text-[#616161]">
              123456789
            </p>
          </div>
          <div className="border-b-[#E7E7E7] border-b-[0.8px]"></div>
          <div>
            <p className="text-[12px]/[100%] font-semibold text-[#2A2A2A]">
              Email
            </p>
            <p className="mt-[8px] text-[14px]/[100%] font-normal text-[#616161]">
              akilabandara@gmail.com
            </p>
          </div>
        </div>
        {/* <SheetFooter className="grid grid-cols-2 gap-[15px]">
          <Button
            variant={"outline"}
            onClick={() => {
              setOpenCollectPaymentIndividualSheet(false);
              setOpenExtraPaymentCollectionSheet(true);
            }}
            className="border-[#69716C] rounded-[10px] text-[13px] font-semibold text-[#69716C] h-[40px]"
          >
            Extra Payment
          </Button>
          <Button
            type="submit"
            onClick={() => {
              setOpenCollectPaymentIndividualSheet(false);
              setOpenPaymentCollectionIndividualSheet(true);
            }}
            className="bg-[#363636] rounded-[10px] text-[13px] font-semibold text-[#FFFFFF]  h-[40px]"
          >
            Collect
          </Button>
        </SheetFooter> */}
      </SheetContent>
    </Sheet>
  );
};

export default ProfileDetails;
