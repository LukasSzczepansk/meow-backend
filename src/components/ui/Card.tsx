import type { HTMLAttributes } from "react";
import clsx from "clsx";

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("meow-card p-5", className)} {...props}>
      {children}
    </div>
  );
}
