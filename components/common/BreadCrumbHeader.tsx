import React from "react";

import Link from "next/link";

interface HeaderProps {
  title: string;
  href: string;
  pathTitle: string;
}

const BreadCrumbHeader: React.FC<HeaderProps> = ({
  title,
  href,
  pathTitle,
}) => {
  return (
    <div className="flex items-center">
      <Link
        href={href}
        className="text-[12px] 3xl:!text-[16px] font-medium text-[#888888]"
      >
        {title}
      </Link>

      <i className="chevron-right-icon size-[12px] 3xl:!size-[16] mx-[6px] 3xl:!mx-[8px] text-[#BDBDBD]" />

      <h1 className="flex items-center font-normal text-[#4F4F4F] text-[12px] 3xl:!text-[16px]">
        {pathTitle}
      </h1>
    </div>
  );
};

export default BreadCrumbHeader;
