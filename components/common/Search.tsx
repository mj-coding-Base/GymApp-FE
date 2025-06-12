"use client";

import React, { useEffect, useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const CommonSearch = ({ placeholder }: { placeholder?: string }) => {
  const [search, setSearch] = useState("");

  const searchparams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const params = new URLSearchParams(searchparams?.toString());

    if (search === "") {
      setSearch("");
      params.delete("search");
      router.push(`${pathname}?${params.toString()}`);
    } else {
      setSearch(search);
      params.delete("page"); //reset pagination when search submit
      params.set("search", search);
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  useEffect(() => {
    const searchValue = searchparams?.get("search") || "";

    setSearch(searchValue);
  }, [searchparams]);

  return (
    <div className="flex items-center justify-between">
      <form
        onSubmit={handleSubmit}
        className="border-[#9E9E9E] border-[0.8px] bg-white px-[15px] rounded-[24px] h-[36.8px] flex items-center w-full"
      >
        <i className="search-icon size-[19.2px] text-[#9E9E9E] mr-[13px]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder ?? "Search by Full name/ NIC"}
          className="outline-none bg-transparent placeholder:text-[#9E9E9E] placeholder:font-normal text-[#9E9E9E] text-[12px] placeholder:text-[12px] font-normal w-full"
        />
      </form>
    </div>
  );
};

export default CommonSearch;