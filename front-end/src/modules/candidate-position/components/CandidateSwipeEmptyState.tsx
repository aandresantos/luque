import { EmptyState } from "../../../shared/components";

function CandidateSwipeEmptyState() {
  return (
    <EmptyState
      title="Nenhum candidato pendente"
      description="Nenhum candidato pendente para esta vaga."
      className="mx-auto max-w-2xl"
    />
  );
}

export { CandidateSwipeEmptyState };
