import { ChevronLeft, PanelRightOpen } from "lucide-react";
import { Button } from "../../../shared/components";

type CandidateSwipeHeaderProps = {
  positionTitle: string;
  progressLabel: string | null;
  progressValue: number | null;
  isDetailsOpen: boolean;
  onExit: () => void;
  onToggleDetails: () => void;
};

function CandidateSwipeHeader({
  positionTitle,
  progressLabel,
  progressValue,
  isDetailsOpen,
  onExit,
  onToggleDetails,
}: CandidateSwipeHeaderProps) {
  return (
    <header className="border-b border-[#464554] bg-[#121212] px-4 py-4 sm:px-6">
      <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <Button
          className="h-auto justify-start border-none bg-transparent px-0 py-0 text-[12px] font-medium tracking-[0.05em] text-[#c7c4d7] uppercase shadow-none hover:bg-transparent hover:text-white"
          icon={<ChevronLeft className="size-4" aria-hidden="true" />}
          onClick={onExit}
        >
          Exit Focus Mode
        </Button>

        <div className="justify-self-center text-center">
          <h1 className="text-lg font-semibold tracking-[-0.01em] text-[#e5e1e4]">
            {positionTitle}
          </h1>
          {progressLabel && progressValue !== null ? (
            <div className="mt-2 flex items-center justify-center gap-2">
              <div className="h-1 w-32 overflow-hidden rounded-full bg-[#2a2a2c]">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-200"
                  style={{
                    width: `${Math.max(0, Math.min(100, progressValue))}%`,
                  }}
                />
              </div>
              <span className="text-[11px] tracking-[0.03em] text-[#c7c4d7]">
                {progressLabel}
              </span>
            </div>
          ) : null}
        </div>

        <div className="justify-self-end">
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-xl border border-transparent text-[#c7c4d7] transition-colors hover:border-[#464554] hover:bg-[#1c1b1d] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            aria-expanded={isDetailsOpen}
            aria-controls="candidate-details-panel"
            aria-label={isDetailsOpen ? "Fechar details" : "Abrir details"}
            onClick={onToggleDetails}
          >
            <PanelRightOpen className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}

export { CandidateSwipeHeader };
