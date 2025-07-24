import ProfileImageUpload from "@/components/common/navbar/ProfileImageUpload";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useProfileDetailsSheet } from "@/hooks/useProfileSheet";
import useUserDetails from "@/hooks/useUserDetails";
import { useEffect } from "react";

const ProfileDetails = () => {
  const { user, loading, refresh } = useUserDetails();
  const { openProfileDetailsSheet, setOpenProfileDetailsSheet } = useProfileDetailsSheet();

  useEffect(() => {
    // Final fallback - if somehow we missed the user data
    if (!loading && !user) {
      const timer = setTimeout(() => {
        refresh();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, loading, refresh]);

  if (loading) {
    return (
      <Sheet open={openProfileDetailsSheet} onOpenChange={setOpenProfileDetailsSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl min-h-[600px] max-h-[calc(100%-40px)]">
          <div className="flex justify-center items-center h-full">
            <p>Loading profile...</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!user) {
    return (
      <Sheet open={openProfileDetailsSheet} onOpenChange={setOpenProfileDetailsSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl min-h-[600px] max-h-[calc(100%-40px)]">
          <div className="flex justify-center items-center h-full">
            <p>Please wait while we load your data...</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={openProfileDetailsSheet} onOpenChange={setOpenProfileDetailsSheet}>
      <SheetContent side="bottom" className="rounded-t-2xl min-h-[600px] max-h-[calc(100%-40px)]">
        <SheetHeader>
          <SheetTitle className="text-[14px] font-semibold text-[#363636] flex items-center">
            <i className="back-icon w-4 h-4 text-black" />
            <p className="ml-[5px] text-[11.2px]/[100%] text-[#212121] font-medium">Back</p>
          </SheetTitle>
        </SheetHeader>
        <div className="px-5 flex flex-col overflow-y-auto gap-[15px]">
          <p className="text-[14px]/[100%] font-medium text-[#3D3D3D] text-center pb-[15px]">
            Admin Profile
          </p>
          
          <ProfileImageUpload imgURL={"/images/profile-image.png"} />
          
          <div>
            <p className="text-[12px]/[100%] font-semibold text-[#2A2A2A]">Full Name</p>
            <p className="mt-[8px] text-[14px]/[100%] font-normal text-[#616161]">
              {user?.name || "Not available"}
            </p>
          </div>
          
          <div className="border-b-[#E7E7E7] border-b-[0.8px]"></div>
          
          {user?.mobile && (
            <>
              <div>
                <p className="text-[12px]/[100%] font-semibold text-[#2A2A2A]">Mobile</p>
                <p className="mt-[8px] text-[14px]/[100%] font-normal text-[#616161]">
                  {user.mobile}
                </p>
              </div>
              <div className="border-b-[#E7E7E7] border-b-[0.8px]"></div>
            </>
          )}

          <div>
            <p className="text-[12px]/[100%] font-semibold text-[#2A2A2A]">Position</p>
            <p className="mt-[8px] text-[14px]/[100%] font-normal text-[#616161]">
              {user?.isAdmin ? "Manager" : "Trainer"}
            </p>
          </div>
          
          <div className="border-b-[#E7E7E7] border-b-[0.8px]"></div>
          
          <div>
            <p className="text-[12px]/[100%] font-semibold text-[#2A2A2A]">Email</p>
            <p className="mt-[8px] text-[14px]/[100%] font-normal text-[#616161]">
              {user?.email || "Not available"}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileDetails;