import React from "react";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const Logo = ({
  className,
  classLink,
}: {
  className?: string;
  classLink?: string;
}) => {
  return (
    <Link href="/" className={classLink}>
      <Image
        src="/images/logo.png"
        alt="Logo"
        width={500}
        height={300}
        className={cn("w-auto h-auto", className)}
      />
    </Link>
  );
};

export default Logo;
