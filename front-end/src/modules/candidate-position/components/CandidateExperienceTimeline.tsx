import { EmptyState } from "../../../shared/components";
import { CandidateExperienceItem } from "./CandidateExperienceItem";
import type { CandidateExperience } from "../types";

type CandidateExperienceTimelineProps = {
  experiences: CandidateExperience[];
  isSupported: boolean;
};

function CandidateExperienceTimeline({
  experiences,
  isSupported,
}: CandidateExperienceTimelineProps) {
  if (!isSupported) {
    return (
      <EmptyState
        title="Historico indisponivel"
        description="Nenhuma experiencia profissional foi informada pelo backend para esta tela ainda."
        className="border-[#464554] bg-[#121212]"
      />
    );
  }

  if (experiences.length === 0) {
    return (
      <EmptyState
        title="Historico vazio"
        description="Nenhuma experiencia profissional foi informada."
        className="border-[#464554] bg-[#121212]"
      />
    );
  }

  return (
    <div className="border-l border-[#464554] pl-2">
      <div className="space-y-5">
        {experiences.map((experience, index) => (
          <CandidateExperienceItem
            key={experience.id}
            experience={experience}
            highlighted={index === 0}
          />
        ))}
      </div>
    </div>
  );
}

export { CandidateExperienceTimeline };
