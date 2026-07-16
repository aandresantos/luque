import type { ReactNode } from "react";
import { cn } from "../../../shared/lib/cn";

type DashboardSectionTitleProps = {
  title: string;
  icon: ReactNode;
  actionLabel?: string;
  mutedAction?: boolean;
};

function DashboardSectionTitle({
  title,
  icon,
  actionLabel,
  mutedAction = false,
}: DashboardSectionTitleProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="text-primary" aria-hidden="true">
          {icon}
        </span>
        <h2 className="text-lg font-medium tracking-[-0.01em] text-[#e5e1e4]">
          {title}
        </h2>
      </div>

      {actionLabel ? (
        <span
          className={cn(
            "text-[11px] tracking-[0.03em]",
            mutedAction ? "text-[#908fa0]" : "text-primary",
          )}
        >
          {actionLabel}
        </span>
      ) : null}
    </div>
  );
}

export { DashboardSectionTitle };
