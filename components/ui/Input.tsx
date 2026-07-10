import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  icon?: React.ReactNode;
};

export default function Input({
  className,
  label,
  icon,
  type = "text",
  id,
  ...props
}: InputProps) {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-muted uppercase tracking-wider pl-1"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-4 text-muted pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          id={id}
          type={type}
          className={twMerge(
            clsx(
              "w-full bg-black/[0.02] dark:bg-white/[0.02] border border-border/80 rounded-xl py-3 text-sm transition-all focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 text-foreground placeholder:text-muted/60",
              icon ? "pl-12 pr-4" : "px-4"
            ),
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
}
