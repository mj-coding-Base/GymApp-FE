import { cn } from "@/lib/utils";
import React from "react";

interface Props {
  children: React.ReactNode;
  className: string;
}

const WhiteCard = ({ children, className }: Props) => {
  return (
    <div className={cn("bg-white rounded-[20px] p-[10px]", className)}>
      {children}
    </div>
  );
};

export default WhiteCard;
