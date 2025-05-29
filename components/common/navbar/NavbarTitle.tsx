"use client";

import React from "react";

import { usePathname } from "next/navigation";
import { sidebarData } from "@/data/sidebar";

const NavbarTitle = () => {
  const pathname = usePathname();

  return (
    <h1 className="text-[#262626] text-base 3xl:text-[21px] font-medium">
      {sidebarData.find((item) => item.url === pathname)?.title ?? ""}
    </h1>
  );
};

export default NavbarTitle;
