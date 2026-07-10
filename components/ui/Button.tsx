"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
};

export default function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-xl font-medium transition-all active:scale-95 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/10",
    secondary:
      "bg-black/5 dark:bg-white/5 text-foreground hover:bg-black/10 dark:hover:bg-white/10",
    outline:
      "border border-border bg-transparent text-foreground hover:bg-black/5 dark:hover:bg-white/5",
    ghost:
      "bg-transparent text-foreground hover:bg-black/5 dark:hover:bg-white/5",
    accent:
      "bg-accent text-accent-foreground hover:bg-accent/90 shadow-md shadow-accent/10",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  return (
    <button
      className={twMerge(
        clsx(baseStyles, variants[variant], sizes[size], className)
      )}
      {...props}
    >
      {children}
    </button>
  );
}
