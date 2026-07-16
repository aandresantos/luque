import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Spinner } from "./Spinner";
import { cn } from "../lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  icon?: ReactNode;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled,
      icon,
      loading = false,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-base)] border border-transparent bg-primary px-4 text-sm font-medium text-foreground shadow-[var(--shadow-soft)] transition-colors duration-150",
          "hover:bg-[color-mix(in_oklab,var(--color-primary)_88%,black)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <Spinner className="text-foreground" label="Processando" />
        ) : (
          icon
        )}
        <span>{children}</span>
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
