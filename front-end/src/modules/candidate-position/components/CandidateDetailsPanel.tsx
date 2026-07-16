import { useEffect } from "react";
import { X } from "lucide-react";
import { CandidateDetailsTabs } from "./CandidateDetailsTabs";
import { CandidateExperienceTimeline } from "./CandidateExperienceTimeline";
import { CandidateNotesTab } from "./CandidateNotesTab";
import type {
  CandidateDetailsTab,
  CandidateExperience,
  CandidateForSwipe,
  CandidatePositionNote,
} from "../types";

type CandidateDetailsPanelProps = {
  candidate: CandidateForSwipe | null;
  experiences: CandidateExperience[];
  experienceSupported: boolean;
  notes: CandidatePositionNote[];
  notesSupported: boolean;
  activeTab: CandidateDetailsTab;
  isOpen: boolean;
  onClose: () => void;
  onTabChange: (tab: CandidateDetailsTab) => void;
};

function CandidateDetailsPanel({
  activeTab,
  candidate,
  experienceSupported,
  experiences,
  isOpen,
  notes,
  notesSupported,
  onClose,
  onTabChange,
}: CandidateDetailsPanelProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <aside
      id="candidate-details-panel"
      className={`absolute bottom-0 right-0 top-0 z-20 flex w-full max-w-[360px] transition-transform duration-200 ease-out ${
        isOpen ? "translate-x-0" : "translate-x-[calc(100%-40px)]"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className="w-10 shrink-0 border-l border-[#464554]/50 border-r border-[#464554] bg-[#18181b] text-[#c7c4d7] [writing-mode:vertical-rl] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        aria-expanded={isOpen}
        aria-controls="candidate-details-panel"
        onClick={isOpen ? onClose : () => onTabChange("experience")}
      >
        Details
      </button>

      <div className="flex-1 overflow-auto border-l border-[#464554] bg-[#18181b] p-6 shadow-[-8px_0_12px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.01em] text-[#e5e1e4]">
              Detailed Profile
            </h2>
            <p className="mt-1 text-sm text-[#c7c4d7]">
              {candidate?.candidate.name ?? "Selecione um candidato"}
            </p>
          </div>

          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-lg text-[#c7c4d7] transition-colors hover:bg-[#1c1b1d] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            onClick={onClose}
            aria-label="Fechar details"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6">
          <CandidateDetailsTabs activeTab={activeTab} onChange={onTabChange} />
        </div>

        <div className="mt-6">
          {activeTab === "experience" ? (
            <CandidateExperienceTimeline
              experiences={experiences}
              isSupported={experienceSupported}
            />
          ) : (
            <CandidateNotesTab notes={notes} isSupported={notesSupported} />
          )}
        </div>
      </div>
    </aside>
  );
}

export { CandidateDetailsPanel };
