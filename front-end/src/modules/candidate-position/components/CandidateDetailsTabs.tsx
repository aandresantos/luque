import { cn } from "../../../shared/lib/cn";
import type { CandidateDetailsTab } from "../types";

type CandidateDetailsTabsProps = {
  activeTab: CandidateDetailsTab;
  onChange: (tab: CandidateDetailsTab) => void;
};

function CandidateDetailsTabs({
  activeTab,
  onChange,
}: CandidateDetailsTabsProps) {
  return (
    <div className="inline-flex rounded-[6px] border border-[#464554] bg-[#131315] p-1">
      {[
        { id: "experience", label: "Historico" },
        { id: "notes", label: "Consideracoes" },
      ].map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={cn(
            "rounded-[4px] px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
            activeTab === tab.id
              ? "bg-[#1c1b1d] text-[#e5e1e4]"
              : "text-[#c7c4d7] hover:text-white",
          )}
          onClick={() => {
            onChange(tab.id as CandidateDetailsTab);
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export { CandidateDetailsTabs };
