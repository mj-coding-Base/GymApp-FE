"use client";

import React, { useEffect, useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ChevronsLeft, ChevronsRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

interface CustomPaginationProps {
  totalCount?: number;
  className?: string;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  totalCount,
  className,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const buttons = [];

  const buttonClass =
    "size-9 3xl:!size-12 text-[12px] 3xl:!text-[16px] text-white font-normal bg-[#94C1AF] cursor-pointer";

  const inactiveClass =
    "size-9 3xl:!size-12 text-[12px] 3xl:!text-[16px] text-[#212121] font-normal bg-[#D1D1D1] disabled:!opacity-100";

  const totalPages = Math.ceil((totalCount ?? itemsPerPage) / itemsPerPage);

  const createButton = (
    i: string | number,
    variant: "default" | "outline",
    onClick: (() => void) | undefined,
    className: string,
    children: React.ReactNode,
    isDisabled?: boolean
  ) => (
    <Button
      key={i}
      variant={variant}
      onClick={onClick}
      className={className}
      disabled={isDisabled ? true : false}
    >
      {children}
    </Button>
  );

  if (totalPages <= 5) {
    for (let i = 0; i < totalPages; i++) {
      buttons.push(createPaginationButton(i));
    }
  } else {
    if (currentPage < 3) {
      // Show first 3 pages + ellipsis + last page
      for (let i = 0; i < 3; i++) {
        buttons.push(createPaginationButton(i));
      }
      buttons.push(
        createButton("...", "default", undefined, inactiveClass, "...", true)
      );
      buttons.push(createPaginationButton(totalPages - 1));
    } else if (currentPage > totalPages - 4) {
      // Show first page + ellipsis + last 3 pages
      buttons.push(createPaginationButton(0));
      buttons.push(
        createButton("...", "default", undefined, inactiveClass, "...", true)
      );
      for (let i = totalPages - 3; i < totalPages; i++) {
        buttons.push(createPaginationButton(i));
      }
    } else {
      // Show first + ellipsis + current + ellipsis + last
      buttons.push(createPaginationButton(0));
      buttons.push(
        createButton("...", "default", undefined, inactiveClass, "...", true)
      );
      buttons.push(createPaginationButton(currentPage));
      buttons.push(
        createButton("...", "default", undefined, inactiveClass, "...", true)
      );
      buttons.push(createPaginationButton(totalPages - 1));
    }
  }

  function createPaginationButton(i: number) {
    const variant = currentPage === i ? "default" : "outline";

    const onClick = () => {
      const searchparams = new URLSearchParams(searchParams.toString());

      if (i === 0) {
        if (searchParams.get("playlistId")) {
          searchparams.delete("pagePlaylist");
          router.push(`${pathname}?${searchparams.toString()}`);
        } else {
          searchparams.delete("page");
          router.push(`${pathname}?${searchparams.toString()}`);
        }

        setCurrentPage(0);

        return;
      }

      searchparams.set("page", (i + 1).toString());

      router.push(`${pathname}?${searchparams.toString()}`);
      setCurrentPage(i);
    };

    const className = cn(
      buttonClass,
      currentPage === i
        ? "bg-[#4F4F4F] text-white border-none"
        : "bg-[#D1D1D1] text-[#212121] border-none"
    );

    return createButton(i, variant, onClick, className, i + 1);
  }

  const handleNavigateLastPage = () => {
    const searchparams = new URLSearchParams(searchParams.toString());

    if (currentPage === totalPages - 1) return;

    searchparams.set("page", (currentPage + 2).toString());

    router.push(`${pathname}?${searchparams.toString()}`);

    setCurrentPage(currentPage + 1);
  };

  const handleNavigateFirstPage = () => {
    const searchparams = new URLSearchParams(searchParams.toString());

    if (currentPage === 0) return;

    if (currentPage === 1) {
      searchparams.delete("page");
      router.push(`${pathname}?${searchparams.toString()}`);
      setCurrentPage(0);

      return;
    }

    searchparams.set("page", currentPage.toString());

    router.push(`${pathname}?${searchparams.toString()}`);

    setCurrentPage(currentPage - 1);
  };

  useEffect(() => {
    const items = searchParams.get("items");

    const page = searchParams.get("page");

    if (items) {
      setItemsPerPage(parseInt(items));
    }

    if (page) {
      setCurrentPage(parseInt(page) - 1);
    }
  }, [searchParams]);

  return (
    <div
      className={cn(
        "flex flex-row items-center gap-[9px] 3xl:!gap-[12px] mx-auto",
        totalPages > 5 && "justify-evenly w-full",
        className
      )}
    >
      <Button
        aria-label="Go to previous page"
        variant="outline"
        size="icon"
        className="size-9 3xl:!size-12 bg-[#D1D1D1] border-none disabled:opacity-50 cursor-pointer"
        onClick={handleNavigateFirstPage}
        disabled={currentPage === 0}
      >
        <ChevronsLeft
          className="size-[18px] 3xl:!size-6 text-[#212121]"
          aria-hidden="true"
        />
      </Button>
      {buttons.map((button, index) => (
        <React.Fragment key={index}>{button}</React.Fragment>
      ))}
      {buttons.length === 0 && (
        <Button
          variant="default"
          onClick={() => setCurrentPage(0)}
          className={cn(
            buttonClass,
            currentPage === 0 &&
              "size-9 3xl:!size-12 text-[12px] 3xl:!text-[16px] text-white font-normal bg-red-400 cursor-pointer"
          )}
        >
          1
        </Button>
      )}
      <Button
        aria-label="Go to next page"
        variant="outline"
        size="icon"
        className="size-9 3xl:!size-12 bg-[#D1D1D1] border-none disabled:opacity-50 cursor-pointer"
        onClick={handleNavigateLastPage}
        disabled={currentPage + 1 === totalPages || totalPages === 0}
      >
        <ChevronsRight
          className="size-[18px] 3xl:!size-6 text-[#212121]"
          aria-hidden="true"
        />
      </Button>
    </div>
  );
};

export default CustomPagination;
