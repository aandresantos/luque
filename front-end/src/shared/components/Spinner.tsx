import { LoaderCircle } from "lucide-react";
import { cn } from "../lib/cn";

type SpinnerProps = {
  className?: string;
  label?: string;
};

function Spinner({ className, label = "Carregando" }: SpinnerProps) {
  return (
    <span
      className={cn("inline-flex items-center justify-center", className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
    </span>
  );
}

export { Spinner };
