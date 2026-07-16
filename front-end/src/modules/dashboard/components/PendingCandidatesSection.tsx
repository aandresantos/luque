import { ClipboardList, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../shared/components";
import { DashboardSectionTitle } from "./DashboardSectionTitle";
import type { PendingCandidate } from "../types";

type PendingCandidatesSectionProps = {
  candidates: PendingCandidate[];
  reviewPath: string;
};

function PendingCandidatesSection({
  candidates,
  reviewPath,
}: PendingCandidatesSectionProps) {
  const navigate = useNavigate();

  return (
    <section className="space-y-4">
      <DashboardSectionTitle
        title="Candidatos aguardando avaliação"
        icon={<ClipboardList className="size-[18px]" />}
        actionLabel={`View all (${candidates.length + 10})`}
        mutedAction
      />

      <Card className="overflow-hidden rounded-[4px] border-[#464554] bg-[#121212] p-px shadow-none">
        {candidates.map((candidate, index) => (
          <div key={candidate.id}>
            <div className="group flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#464554] bg-[#2a2a2c] text-sm text-[#c7c4d7]">
                  {candidate.initials}
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-[#e5e1e4]">{candidate.name}</p>
                  <p className="truncate text-[11px] tracking-[0.03em] text-[#c7c4d7]">
                    {candidate.appliedAt} for {candidate.jobTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="inline-flex items-center gap-2 rounded-[2px] bg-[#201f22] px-2 py-1 text-[11px] tracking-[0.03em] text-[#c7c4d7]">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  <span>{candidate.matchScore}% Match</span>
                </div>

                <button
                  type="button"
                  className="rounded-[2px] border border-[#464554] px-3 py-2 text-[11px] tracking-[0.03em] text-[#e5e1e4] opacity-100 transition-colors hover:border-primary/40 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
                  onClick={() => {
                    navigate(reviewPath);
                  }}
                >
                  Avaliar
                </button>
              </div>
            </div>

            {index < candidates.length - 1 ? (
              <div className="h-px bg-[#353437]" />
            ) : null}
          </div>
        ))}
      </Card>
    </section>
  );
}

export { PendingCandidatesSection };
