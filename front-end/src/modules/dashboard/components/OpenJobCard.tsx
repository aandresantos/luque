import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../shared/components";
import type { JobSummary } from "../types";

type OpenJobCardProps = {
  job: JobSummary;
};

function OpenJobCard({ job }: OpenJobCardProps) {
  const navigate = useNavigate();
  const shortlistedWidth = `${(job.pipeline.shortlisted / job.totalCandidates) * 100}%`;
  const reviewWidth = `${(job.pipeline.review / job.totalCandidates) * 100}%`;
  const interviewWidth = `${(job.pipeline.interview / job.totalCandidates) * 100}%`;

  return (
    <Card className="relative flex h-full flex-col justify-between overflow-hidden rounded-[4px] border-[#464554] bg-[#121212] p-[21px] shadow-none">
      <div className="absolute -right-10 -top-10 size-32 rounded-xl bg-primary/5 blur-3xl" />

      <div className="relative space-y-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <span className="rounded-[2px] bg-[rgba(57,72,90,0.2)] px-2 py-1 text-[11px] tracking-[0.03em] text-[#a7b6cc]">
              {job.team}
            </span>
            <span className="inline-flex items-center gap-1 rounded-[2px] bg-primary/10 px-2 py-1 text-[11px] tracking-[0.03em] text-primary">
              <span
                className="size-1.5 rounded-full bg-primary"
                aria-hidden="true"
              />
              {job.newCandidates} novos
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-[1.125rem] font-medium tracking-[-0.01em] text-[#e5e1e4]">
              {job.title}
            </h3>
            <div className="flex items-center gap-1 text-[13px] text-[#c7c4d7]">
              <MapPin className="size-3.5" aria-hidden="true" />
              <span>{job.location}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-[11px] tracking-[0.03em] text-[#c7c4d7]">
            <span>Pipeline Progress</span>
            <span>{job.totalCandidates} Total</span>
          </div>

          <div className="flex h-1.5 overflow-hidden rounded-full bg-[#201f22]">
            <span
              className="bg-[#908fa0]"
              style={{ width: shortlistedWidth }}
            />
            <span className="bg-[#8083ff]" style={{ width: reviewWidth }} />
            <span className="bg-primary" style={{ width: interviewWidth }} />
          </div>

          <button
            type="button"
            className="flex h-9 w-full items-center justify-center rounded-[2px] border border-[#464554] bg-[#201f22] px-3 text-[11px] tracking-[0.03em] text-[#e5e1e4] transition-colors hover:border-primary/40 hover:text-white"
            onClick={() => {
              navigate(job.reviewPath);
            }}
          >
            Review ({job.newCandidates})
          </button>
        </div>
      </div>
    </Card>
  );
}

export { OpenJobCard };
