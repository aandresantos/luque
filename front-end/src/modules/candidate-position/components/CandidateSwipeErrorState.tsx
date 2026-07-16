import { Button, ErrorState } from "../../../shared/components";

type CandidateSwipeErrorStateProps = {
  title: string;
  description: string;
  onRetry: () => void;
  onBack: () => void;
};

function CandidateSwipeErrorState({
  description,
  onBack,
  onRetry,
  title,
}: CandidateSwipeErrorStateProps) {
  return (
    <ErrorState
      title={title}
      description={description}
      className="mx-auto max-w-2xl"
      action={
        <div className="flex flex-wrap gap-3">
          <Button onClick={onRetry}>Tentar novamente</Button>
          <Button
            className="border border-border bg-transparent text-foreground shadow-none hover:bg-white/5"
            onClick={onBack}
          >
            Voltar
          </Button>
        </div>
      }
    />
  );
}

export { CandidateSwipeErrorState };
