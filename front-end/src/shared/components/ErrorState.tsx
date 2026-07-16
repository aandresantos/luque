import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "../lib/cn";

type ErrorStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

function ErrorState({
  action,
  className,
  description,
  title,
}: ErrorStateProps) {
  return (
    <section
      className={cn(
        "rounded-[calc(var(--radius-base)+0.125rem)] border border-destructive/25 bg-destructive/8 p-6 text-left",
        className,
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex size-10 items-center justify-center rounded-[var(--radius-base)] border border-destructive/25 bg-background text-destructive">
        <AlertTriangle className="size-4" aria-hidden="true" />
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

export { ErrorState };
