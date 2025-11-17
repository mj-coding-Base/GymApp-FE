"use client";


import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useProfileDetailsSheet } from "@/hooks/useProfileSheet";
import { useResetPasswordSheet } from "@/hooks/useResetPasswordSheet";
import { logout } from "@/lib/authentication";
import { trainersCache } from "@/lib/trainersCache";
import { packagesCache } from "@/lib/packagesCache";
import { equipmentCache } from "@/lib/equipmentCache";
import { dashboardCache } from "@/lib/dashboardCache";
import { customersCache } from "@/lib/customersCache";
import { clearPendingRequests } from "@/utils/requestDeduplication";
import Image from "next/image";
import { useState } from "react";
import Logo from "../Logo";
import NavbarTitle from "./NavbarTitle";

const Navbar = () => {
  const { setOpenProfileDetailsSheet } = useProfileDetailsSheet();
  const { setOpenResetPasswordSheet } = useResetPasswordSheet();

  const handleViewProfile = () => {
    setOpenProfileDetailsSheet(true);
  };

  const handleResetPassword = () => {
    setOpenResetPasswordSheet(true);
  };

  const [loading, setLoading] = useState(false);
  console.log(loading);
  return (
    <nav className="h-[50.56px] lg:h-[46.5px] 3xl:!h-[67.24px] min-h-[50.56px] lg:min-h-[46.5px] 3xl:!min-h-[67.24px] bg-white px-4 lg:px-6 3xl:px-8 flex items-center justify-between lg:border-b border-[#EBEBEB] sticky top-0 z-50">
      <Logo className="w-[84.93px] h-auto" classLink="" />
      <NavbarTitle />

      <div className="flex items-center gap-x-2">
        {/* Reduced gap here */}
        <button className="flex items-center justify-center cursor-pointer">
          <i className="notification-icon w-6 h-6 text-black" />
        </button>
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center justify-center cursor-pointer p-2">
              <Image
                src="/images/profile-image.png"
                alt="Logo"
                width={30}
                height={30}
                className="w-[30px] h-[30px] rounded-full object-cover"
              />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[181px] rounded-[8px] p-[8px]">
            <div className="flex flex-col items-start">
              <Button variant={"ghost"} onClick={handleViewProfile}>
                <i className="view-profile-icon w-4 h-4 text-[#424242]" />
                <p className="text-[12px]/[100%] text-[#424242] font-normal">
                  View Profile
                </p>
              </Button>
              <Button variant={"ghost"} onClick={handleResetPassword}>
                <i className="reset-password-icon w-4 h-4 text-[#424242]" />
                <p className="text-[12px]/[100%] text-[#424242] font-normal">
                  Reset Password
                </p>
              </Button>
              <Button
                variant={"ghost"}
                onClick={async () => {
                  setLoading(true);
                  
                  // 🔒 SECURITY: Clear ALL multi-tenant caches, global state, and storage immediately
                  if (typeof window !== 'undefined') {
                    // Clear all multi-tenant caches (all gyms)
                    trainersCache.clearAll();
                    packagesCache.clearAll();
                    equipmentCache.clearAll();
                    dashboardCache.clearAll();
                    customersCache.clearAll();
                    
                    // Clear request deduplication cache
                    clearPendingRequests();
                    
                    // Clear all Zustand stores
                    try {
                      const { useGroupDetailsStore } = await import('@/hooks/useGroupDetailsStore');
                      const { useDailyAttendanceSheet } = await import('@/hooks/useDailyAttendanceSheet');
                      useGroupDetailsStore.getState().clearStore();
                      useDailyAttendanceSheet.getState().clearStore();
                    } catch (err) {
                      console.error('[SECURITY] Error clearing Zustand stores on logout:', err);
                    }
                    
                    // Clear auth tokens
                    localStorage.removeItem('x-auth-token');
                    localStorage.removeItem('refresh-token');
                    localStorage.removeItem('gym-id'); // Should never exist, but clear just in case
                    
                    // Clear any legacy non-gym-specific caches (fallback cleanup)
                    localStorage.removeItem('gymapp-dashboard-cache');
                    localStorage.removeItem('gymapp-dashboard-cache-expiry');
                    localStorage.removeItem('gymapp-customers-cache');
                    localStorage.removeItem('gymapp-customers-cache-expiry');
                  }
                  
                  // Clear server session
                  await logout();
                  
                  // Redirect immediately
                  window.location.href = "/sign-in";
                }}
                disabled={loading}
              >
                <i className="logout-icon w-4 h-4 text-[#424242]" />
                <p className="text-[12px]/[100%] text-[#424242] font-normal">
                  {loading ? 'Logging out...' : 'Log Out'}
                </p>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        {/* <button className="flex items-center justify-center cursor-pointer p-2">
          <Image
            src="/images/profile-image.png"
            alt="Logo"
            width={30}
            height={30}
            className="w-[30px] h-[30px] rounded-full object-cover"
          />
        </button> */}
      </div>
    </nav>
  );
};

export default Navbar;
