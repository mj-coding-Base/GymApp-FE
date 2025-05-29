"use client";

import Link from "next/link";

import Logo from "@/components/common/Logo";
import { cn } from "@/lib/utils";

interface CardWrapperProps {
  logo: boolean;
  label: string;
  title: string;
  backButtonTitle: string;
  backButtonHref: string;
  backButtonLabel: string;
  titleClass: string;
  headerTexts: string;
  className: string;
  showCheckEmail?: boolean;
  setShowCheckEmail?: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
}

const CardWrapper = ({
  logo,
  label,
  title,
  backButtonHref,
  backButtonTitle,
  backButtonLabel,
  titleClass,
  headerTexts,
  className,
  children,
}: CardWrapperProps) => {
  return (
    <div
      className={cn(
        `flex flex-col shadow-none w-full mx-auto px-[4px] md:px-[20px] lg:px-[20px] py-[40px] h-[507px] my-auto border-none`,
        className
      )}
    >
      <Logo className={`w-[136.66px] h-[57.66px] ${logo ? "" : "hidden"}`} />

      <div
        className={cn(
          `w-full flex gap-[10px] flex-col ${logo ? "mt-[45px]" : ""}`,
          headerTexts
        )}
      >
        <p className={cn(`text-black font-semibold text-[18px]`, titleClass)}>
          {title}
        </p>
        <p className="text-[12px]">{label}</p>
      </div>
      <div className="flex flex-col mt-[25px] h-full">{children}</div>
      <div className="w-full font-normal text-sm flex items-center justify-center mt-5 space-x-1">
        <span className="text-foreground">{backButtonTitle}</span>
        <Link
          href={backButtonHref}
          className="text-black font-semibold text-sm"
        >
          {backButtonLabel}
        </Link>
      </div>
    </div>
  );
};

export default CardWrapper;
