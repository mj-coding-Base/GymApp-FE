"use client";

import React from "react";

import Logo from "../Logo";
import NavbarTitle from "./NavbarTitle";
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useProfileDetailsSheet } from "@/hooks/useProfileSheet";
import { useResetPasswordSheet } from "@/hooks/useResetPasswordSheet";
import { logout } from "@/lib/authentication";

const Navbar = () => {
  const { setOpenProfileDetailsSheet } = useProfileDetailsSheet();
  const { setOpenResetPasswordSheet } = useResetPasswordSheet();

  const handleViewProfile = () => {
    setOpenProfileDetailsSheet(true);
  };

  const handleResetPassword = () => {
    setOpenResetPasswordSheet(true);
  };

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
                  await logout();
                  window.location.href = "/sign-in";
                }}
              >
                <i className="logout-icon w-4 h-4 text-[#424242]" />
                <p className="text-[12px]/[100%] text-[#424242] font-normal">
                  Log Out
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
