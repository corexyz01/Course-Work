"use client";

import * as React from "react";
import { cn } from "../../lib/cn";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "raspberry" | "lime" | "outline" | "destructive";
  size?: "sm" | "md";
};

export function Button({ className, variant = "raspberry", size = "md", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none shadow-sm";

  const variants = {
    raspberry:
      "bg-gradient-to-b from-rose-500 to-rose-600 text-white hover:from-rose-400 hover:to-rose-500 shadow-rose-500/20",
    lime: "bg-gradient-to-b from-lime-400 to-lime-500 text-zinc-900 hover:from-lime-300 hover:to-lime-400 shadow-lime-500/20",
    outline:
      "border border-rose-200 bg-white text-zinc-900 hover:bg-rose-50 hover:border-rose-300 shadow-none",
    destructive:
      "bg-gradient-to-b from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 shadow-red-500/20",
  };

  const sizes = {
    sm: "h-9 px-3",
    md: "h-10 px-4",
  };

  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
