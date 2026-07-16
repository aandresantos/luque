import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[calc(var(--radius-base)+0.125rem)] border border-border bg-surface p-5 shadow-[var(--shadow-soft)]",
        className,
      )}
      {...props}
    />
  );
}

export { Card };
