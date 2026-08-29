"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "meow";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "meow-btn-primary",
  secondary: "meow-btn-secondary",
  outline: "meow-btn-outline",
  ghost: "meow-btn-ghost",
  meow: "meow-btn-meow",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", fullWidth, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={clsx(
        "meow-button meow-touch inline-flex min-h-[50px] items-center justify-center gap-2 px-5 py-3 text-[14px] font-bold disabled:cursor-not-allowed disabled:opacity-45",
        variantClasses[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
