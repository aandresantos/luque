import type { CandidateExperience } from "../types";

type CandidateExperienceItemProps = {
  experience: CandidateExperience;
  highlighted?: boolean;
};

function CandidateExperienceItem({
  experience,
  highlighted = false,
}: CandidateExperienceItemProps) {
  const period = `${experience.startDate} - ${
    experience.isCurrent ? "Atual" : (experience.endDate ?? "N/A")
  }`;

  return (
    <div className="relative pl-6">
      <span
        className={`absolute left-0 top-1 size-3.5 rounded-full border-2 bg-[#131315] ${
          highlighted ? "border-primary" : "border-[#464554]"
        }`}
        aria-hidden="true"
      />
      <div className="space-y-1">
        <p className="text-sm font-medium text-[#e5e1e4]">{experience.role}</p>
        <p className="text-[13px] text-[#c7c4d7]">
          {experience.companyName} • {period}
        </p>
        {experience.description ? (
          <p className="pt-1 text-[13px] leading-6 text-[#c7c4d7]">
            {experience.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export { CandidateExperienceItem };
