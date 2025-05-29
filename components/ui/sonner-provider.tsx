"use client";

import type React from "react";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "next-themes";

interface ToasterProps {
  // Custom props for the Toaster component
  closeButton?: boolean;
  richColors?: boolean;
  expandByDefault?: boolean;
  visibleToasts?: number;
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";
  toastOptions?: {
    duration?: number;
    className?: string;
    style?: React.CSSProperties;
  };
}

export function SonnerProvider({
  closeButton = true,
  richColors = false,
  visibleToasts = 3,
  position = "bottom-right",
  toastOptions = {
    duration: 5000,
  },
}: ToasterProps) {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      toastOptions={{
        duration: toastOptions.duration,
        className: `group toast group-[.toaster]:border-border group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:shadow-lg rounded-[10px] lg:rounded-[7.5px] 3xl:!rounded-[10px] w-max !bg-[#3D3D3D] overflow-hidden ${
          toastOptions.className || ""
        }`,
        style: toastOptions.style,
      }}
      closeButton={closeButton}
      richColors={richColors}
      visibleToasts={visibleToasts}
      position={position}
    />
  );
}
