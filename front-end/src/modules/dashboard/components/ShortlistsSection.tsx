import { ListChecks } from "lucide-react";
import { Card } from "../../../shared/components";
import { DashboardSectionTitle } from "./DashboardSectionTitle";
import type { ShortlistSummary } from "../types";

type ShortlistsSectionProps = {
  shortlists: ShortlistSummary[];
};

function ShortlistsSection({ shortlists }: ShortlistsSectionProps) {
  return (
    <section className="space-y-4">
      <DashboardSectionTitle
        title="Shortlists para revisão"
        icon={<ListChecks className="size-[18px]" />}
      />

      <Card className="overflow-hidden rounded-[4px] border-[#464554] bg-[#121212] p-[5px] shadow-none">
        {shortlists.map((shortlist, index) => (
          <div key={shortlist.id}>
            <div className="flex items-center gap-4 rounded-[2px] px-3 py-3">
              <div className="flex size-10 items-center justify-center rounded-[2px] bg-[rgba(57,72,90,0.3)] text-[#c7c4d7]">
                <ListChecks className="size-5" aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm text-[#e5e1e4]">{shortlist.title}</p>
                <p className="text-[11px] tracking-[0.03em] text-[#c7c4d7]">
                  {shortlist.status} • {shortlist.candidateCount} candidates
                </p>
              </div>

              <span className="size-2 shrink-0 rounded-full bg-[#ffb4ab]" />
            </div>

            {index < shortlists.length - 1 ? (
              <div className="h-px bg-[#353437]" />
            ) : null}
          </div>
        ))}
      </Card>
    </section>
  );
}

export { ShortlistsSection };
