import { BriefcaseBusiness } from "lucide-react";
import { DashboardSectionTitle } from "./DashboardSectionTitle";
import { OpenJobCard } from "./OpenJobCard";
import type { JobSummary } from "../types";

type OpenJobsSectionProps = {
  jobs: JobSummary[];
};

function OpenJobsSection({ jobs }: OpenJobsSectionProps) {
  return (
    <section className="space-y-4">
      <DashboardSectionTitle
        title="Vagas com novos candidatos"
        icon={<BriefcaseBusiness className="size-[18px]" />}
        actionLabel="View all active jobs"
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {jobs.map((job) => (
          <OpenJobCard key={job.id} job={job} />
        ))}
      </div>
    </section>
  );
}

export { OpenJobsSection };
