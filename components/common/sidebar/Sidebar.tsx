"use client";

import React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import Logo from "../Logo";

import { cn } from "@/lib/utils";
import { sidebarData } from "@/data/sidebar";

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-[230px] 3xl:w-[306px] h-screen border-r border-[#EBEBEB] sticky left-0 top-0 bg-[#FDFDFD] z-50 max-lg:hidden overflow-y-auto hide-scrollbar pb-6 3xl:pb-8">
      <div className="px-[15px] 3xl:px-[20px] flex items-center h-[64px] 3xl:h-[85px]">
        <Logo className="w-[118px] 3xl:w-[157px] h-auto" />
      </div>
      <div className="h-full flex flex-col justify-between w-full">
        <div className="flex flex-col items-center w-full gap-[20px] 3xl:gap-[27px] px-[12px] 3xl:px-[16px]">
          {sidebarData.map((item) => (
            <Link
              href={item.url}
              key={item.id}
              className="w-full h-[36px] 3xl:h-[48px] group"
              prefetch={false}
            >
              <span
                className={cn(
                  "flex flex-row gap-[5px] 3xl:gap-[7px] items-center text-base 3xl:text-lg font-normal size-full rounded-[8px] 3xl:rounded-[11px] px-[8px] 3xl:px-[11px] text-nowrap",
                  pathname.split("/")[1] === item.url.split("/")[1]
                    ? "text-[#F6F5F5] bg-[#65A28C]"
                    : "text-[#4F4F4F] hover:bg-[#65A28C] hover:text-[#F6F5F5] hover:opacity-50"
                )}
              >
                <i
                  className={cn(
                    "size-[18px] 3xl:size-[24px]",
                    item.icon,
                    pathname.split("/")[1] === item.url.split("/")[1]
                      ? "text-white"
                      : "text-[#4C4E64DE] group-hover:text-[#F6F5F5]"
                  )}
                />
                {item.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <span className="text-[11px] 3xl:text-[15px] text-[#363636] font-normal text-center">
        Copyright {new Date().getFullYear()} ©️ ...
        <br /> Developed by Wise Soft Lab <br />
        Version 1.0.2
      </span>
    </div>
  );
};

export default Sidebar;
