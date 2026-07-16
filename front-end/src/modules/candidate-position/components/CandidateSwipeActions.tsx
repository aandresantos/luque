import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, ArrowUp, ExternalLink } from "lucide-react";

type CandidateSwipeActionsProps = {
  disabled: boolean;
  onApprove: () => void;
  onReject: () => void;
  onReviewLater: () => void;
  onOpenProfile: () => void;
};

type ActionButtonProps = {
  label: string;
  shortcut: string;
  icon: ReactNode;
  onClick: () => void;
  disabled: boolean;
  emphasized?: boolean;
};

function ActionButton({
  disabled,
  emphasized = false,
  icon,
  label,
  onClick,
  shortcut,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      className={`group flex min-w-[92px] flex-col items-center gap-2 rounded-[12px] px-2 py-1.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
        emphasized ? "text-primary" : "text-[#c7c4d7]"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      disabled={disabled}
      onClick={onClick}
    >
      <span
        className={`flex size-12 items-center justify-center rounded-[12px] border ${
          emphasized
            ? "border-primary/20 bg-primary text-[#1000a9] shadow-[0_0_7.5px_rgba(192,193,255,0.2)]"
            : "border-[#464554] bg-transparent text-current group-hover:bg-[#1c1b1d]"
        }`}
      >
        {icon}
      </span>
      <span className="flex items-center gap-1 text-[11px] font-medium tracking-[0.03em]">
        <span>{label}</span>
        <span
          className={`rounded-[4px] border px-1.5 py-0.5 text-[10px] ${
            emphasized
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-[#464554] bg-[#2a2a2c] text-[#c7c4d7]"
          }`}
        >
          {shortcut}
        </span>
      </span>
    </button>
  );
}

function CandidateSwipeActions({
  disabled,
  onApprove,
  onOpenProfile,
  onReject,
  onReviewLater,
}: CandidateSwipeActionsProps) {
  return (
    <div className="border-t border-[#464554] bg-[#0e0e10] px-4 py-5 sm:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ActionButton
          label="Rejeitar"
          shortcut="←"
          icon={<ArrowLeft className="size-4" aria-hidden="true" />}
          onClick={onReject}
          disabled={disabled}
        />

        <div className="flex flex-wrap items-center justify-center gap-4">
          <ActionButton
            label="Revisar Depois"
            shortcut="↑"
            icon={<ArrowUp className="size-4" aria-hidden="true" />}
            onClick={onReviewLater}
            disabled={disabled}
          />
          <div className="hidden h-12 w-px bg-[#464554]/50 sm:block" />
          <ActionButton
            label="Abrir Perfil"
            shortcut="Enter"
            icon={<ExternalLink className="size-4" aria-hidden="true" />}
            onClick={onOpenProfile}
            disabled={disabled}
          />
        </div>

        <ActionButton
          label="Aprovar"
          shortcut="→"
          icon={<ArrowRight className="size-4" aria-hidden="true" />}
          onClick={onApprove}
          disabled={disabled}
          emphasized
        />
      </div>
    </div>
  );
}

export { CandidateSwipeActions };
