import { EmptyState, Input } from "../../../shared/components";
import type { CandidatePositionNote } from "../types";

type CandidateNotesTabProps = {
  notes: CandidatePositionNote[];
  isSupported: boolean;
};

function CandidateNotesTab({ isSupported, notes }: CandidateNotesTabProps) {
  if (!isSupported) {
    return (
      <EmptyState
        title="Consideracoes em breve"
        description="As consideracoes estarao disponiveis em breve."
        className="border-[#464554] bg-[#121212]"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[6px] border border-[#464554] bg-[#121212] p-3">
        <Input
          placeholder="Adicionar consideracao"
          disabled
          aria-label="Adicionar consideracao"
        />
      </div>

      {notes.length === 0 ? (
        <EmptyState
          title="Sem consideracoes"
          description="Nenhuma consideracao foi registrada para este candidato nesta vaga."
          className="border-[#464554] bg-[#121212]"
        />
      ) : null}
    </div>
  );
}

export { CandidateNotesTab };
