"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Chip({ selected, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={clsx("meow-chip meow-touch", selected && "meow-chip-active", className)}
      {...props}
    >
      {children}
    </button>
  );
}
