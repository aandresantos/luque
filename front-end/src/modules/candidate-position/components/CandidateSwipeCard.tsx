import { MapPin, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import type { CandidateForSwipe } from "../types";

type CandidateSwipeCardProps = {
  candidate: CandidateForSwipe;
  style?: CSSProperties;
  className?: string;
  isProcessing?: boolean;
};

function CandidateSwipeCard({
  candidate,
  className,
  isProcessing = false,
  style,
}: CandidateSwipeCardProps) {
  return (
    <article
      className={`flex h-full max-h-[720px] w-full max-w-[640px] flex-col overflow-hidden rounded-[8px] border border-[#464554] bg-[#121212] shadow-[0_8px_16px_rgba(0,0,0,0.4)] ${className ?? ""}`}
      style={style}
      aria-busy={isProcessing}
    >
      <div className="flex-1 overflow-auto p-8 sm:p-10">
        <div className="space-y-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#464554] bg-[#1c1b1d] text-xl font-medium text-[#c7c4d7]">
                {candidate.candidate.avatarUrl ? (
                  <img
                    src={candidate.candidate.avatarUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  candidate.candidate.name
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                )}
              </div>

              <div className="space-y-1">
                <h2 className="text-3xl font-semibold tracking-[-0.02em] text-[#e5e1e4]">
                  {candidate.candidate.name}
                </h2>
                {candidate.candidate.headline ? (
                  <p className="text-sm font-medium text-primary">
                    {candidate.candidate.headline}
                  </p>
                ) : null}
                {candidate.candidate.location ? (
                  <div className="flex items-center gap-1 text-[13px] text-[#c7c4d7]">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    <span>{candidate.candidate.location}</span>
                  </div>
                ) : null}
              </div>
            </div>

            {candidate.candidate.matchPercentage !== null ? (
              <div className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[11px] font-bold tracking-[0.025em] text-primary">
                <Sparkles className="size-3.5" aria-hidden="true" />
                {candidate.candidate.matchPercentage}% ADERENCIA
              </div>
            ) : null}
          </div>

          <div className="h-px bg-[#464554]/50" />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#c7c4d7]">
                Experience
              </p>
              <p className="text-sm font-medium text-[#e5e1e4]">
                {candidate.candidate.experienceYears !== null
                  ? `${candidate.candidate.experienceYears} Years`
                  : "Unavailable"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#c7c4d7]">
                Availability
              </p>
              <p className="text-sm font-medium text-[#e5e1e4]">
                {candidate.candidate.availability ?? "Unavailable"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#c7c4d7]">
                Expectation
              </p>
              <p className="text-sm text-[#c7c4d7]">
                {candidate.candidate.salaryExpectation ?? "Hidden"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#c7c4d7]">
              Professional Summary
            </p>
            <p className="text-base leading-[1.65] text-[#e5e1e4]">
              {candidate.candidate.summary ??
                "O candidato ainda nao possui resumo profissional disponivel."}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#c7c4d7]">
              Core Technologies
            </p>
            {candidate.candidate.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {candidate.candidate.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded-full border border-[#464554] bg-[#2a2a2c] px-2.5 py-1 text-[12px] font-medium text-[#e5e1e4]"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#c7c4d7]">
                Nenhuma tecnologia principal foi informada.
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export { CandidateSwipeCard };
