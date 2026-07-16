import type { ReactNode } from "react";
import { SearchX } from "lucide-react";
import { cn } from "../lib/cn";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

function EmptyState({
  action,
  className,
  description,
  title,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "rounded-[calc(var(--radius-base)+0.125rem)] border border-dashed border-border bg-surface/70 p-6 text-left",
        className,
      )}
      aria-live="polite"
    >
      <div className="flex size-10 items-center justify-center rounded-[var(--radius-base)] border border-border bg-background text-muted">
        <SearchX className="size-4" aria-hidden="true" />
      </div>
      <div className="mt-4 space-y-2">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="text-sm leading-6 text-muted">{description}</p>
      </div>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}

export { EmptyState };
