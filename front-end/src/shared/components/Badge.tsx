import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

type BadgeTone = "neutral" | "primary" | "destructive";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-border bg-white/5 text-muted",
  primary: "border-primary/20 bg-primary/12 text-primary",
  destructive: "border-destructive/20 bg-destructive/12 text-destructive",
};

function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em]",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
