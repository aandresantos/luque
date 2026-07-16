import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../../../shared/api/api-error";
import { usePendingCandidates } from "../hooks/usePendingCandidates";
import { useReviewCandidate } from "../hooks/useReviewCandidate";
import { useCandidateExperiences } from "../hooks/useCandidateExperiences";
import { useCandidateNotes } from "../hooks/useCandidateNotes";
import { CandidateDetailsPanel } from "../components/CandidateDetailsPanel";
import { CandidateSwipeActions } from "../components/CandidateSwipeActions";
import { CandidateSwipeEmptyState } from "../components/CandidateSwipeEmptyState";
import { CandidateSwipeErrorState } from "../components/CandidateSwipeErrorState";
import { CandidateSwipeHeader } from "../components/CandidateSwipeHeader";
import { CandidateSwipeSkeleton } from "../components/CandidateSwipeSkeleton";
import { CandidateSwipeStack } from "../components/CandidateSwipeStack";
import type {
  CandidateDetailsTab,
  CandidateForSwipe,
  CandidateReviewAction,
} from "../types";

function CandidateSwipePage() {
  const navigate = useNavigate();
  const { positionId } = useParams();
  const { candidates, error, isLoading, position } =
    usePendingCandidates(positionId);
  const reviewMutation = useReviewCandidate(positionId);

  const [queue, setQueue] = useState<CandidateForSwipe[]>([]);
  const [processedCount, setProcessedCount] = useState(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CandidateDetailsTab>("experience");
  const [mutationError, setMutationError] = useState<string | null>(null);

  useEffect(() => {
    setQueue(candidates);
  }, [candidates]);

  const currentCandidate = queue[0] ?? null;
  const nextCandidate = queue[1];

  useEffect(() => {
    setActiveTab("experience");
  }, [currentCandidate?.candidatePositionId]);

  const experiencesQuery = useCandidateExperiences(
    currentCandidate?.candidate.id,
    isDetailsOpen && activeTab === "experience",
  );
  const notesQuery = useCandidateNotes(
    currentCandidate?.candidatePositionId,
    isDetailsOpen && activeTab === "notes",
  );

  const progressLabel = useMemo(() => {
    if (!currentCandidate) {
      return null;
    }

    const currentIndex = processedCount + 1;
    const total = processedCount + queue.length;

    if (total === 0) {
      return null;
    }

    return `${currentIndex} de ${total}`;
  }, [currentCandidate, processedCount, queue.length]);

  const progressValue = useMemo(() => {
    if (!progressLabel || !currentCandidate) {
      return null;
    }

    const currentIndex = processedCount + 1;
    const total = processedCount + queue.length;

    if (total === 0) {
      return null;
    }

    return (currentIndex / total) * 100;
  }, [currentCandidate, processedCount, progressLabel, queue.length]);

  function handleExit() {
    navigate(-1);
  }

  function handleOpenProfile() {
    if (!currentCandidate) {
      return;
    }

    navigate(`/app/candidate-profiles/${currentCandidate.candidate.id}`);
  }

  function handleDecision(action: CandidateReviewAction) {
    if (!currentCandidate || !positionId || reviewMutation.isPending) {
      return;
    }

    setMutationError(null);

    reviewMutation.mutate(
      {
        action,
        positionId,
        candidatePositionId: currentCandidate.candidatePositionId,
        candidateProfileId: currentCandidate.candidateProfileId,
      },
      {
        onSuccess: () => {
          setQueue((previousQueue) =>
            previousQueue.filter(
              (candidate) =>
                candidate.candidatePositionId !==
                currentCandidate.candidatePositionId,
            ),
          );
          setProcessedCount((value) => value + 1);
          setIsDetailsOpen(false);
          setActiveTab("experience");
        },
        onError: (mutationErrorValue) => {
          const fallbackMessage =
            mutationErrorValue instanceof ApiError
              ? mutationErrorValue.message
              : "Nao foi possivel processar a decisao.";

          setMutationError(fallbackMessage);
        },
      },
    );
  }

  useEffect(() => {
    function shouldIgnoreShortcut(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      const tagName = target.tagName.toLowerCase();
      return (
        tagName === "input" ||
        tagName === "textarea" ||
        target.isContentEditable
      );
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (shouldIgnoreShortcut(event.target) || reviewMutation.isPending) {
        return;
      }

      if (event.key === "Escape") {
        setIsDetailsOpen(false);
        return;
      }

      if (!currentCandidate) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handleDecision("reject");
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleDecision("approve");
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        handleDecision("reviewLater");
      }

      if (event.key === "Enter") {
        event.preventDefault();
        handleOpenProfile();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentCandidate, reviewMutation.isPending]);

  if (!positionId) {
    return (
      <div className="p-6 sm:p-8">
        <CandidateSwipeErrorState
          title="Vaga invalida"
          description="Nenhuma consulta pode ser executada sem um positionId valido."
          onRetry={() => {
            navigate(0);
          }}
          onBack={handleExit}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8">
        <CandidateSwipeSkeleton />
      </div>
    );
  }

  if (error) {
    const errorStatus = error instanceof ApiError ? error.status : null;
    const title =
      errorStatus === 404
        ? "Vaga inexistente"
        : errorStatus === 403
          ? "Acesso negado"
          : "Nao foi possivel carregar a avaliacao";
    const description =
      errorStatus === 404
        ? "A vaga informada nao foi encontrada."
        : errorStatus === 403
          ? "Voce nao possui acesso a esta vaga."
          : error.message;

    return (
      <div className="p-6 sm:p-8">
        <CandidateSwipeErrorState
          title={title}
          description={description}
          onRetry={() => {
            navigate(0);
          }}
          onBack={handleExit}
        />
      </div>
    );
  }

  if (!position || !currentCandidate) {
    return (
      <div className="p-6 sm:p-8">
        <CandidateSwipeEmptyState />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#09090b]">
      <CandidateSwipeHeader
        positionTitle={position.title}
        progressLabel={progressLabel}
        progressValue={progressValue}
        isDetailsOpen={isDetailsOpen}
        onExit={handleExit}
        onToggleDetails={() => {
          setIsDetailsOpen((value) => !value);
        }}
      />

      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex min-w-0 flex-1 items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(18,18,18,0.65),_transparent_55%)] px-4 py-6 sm:px-6">
          <div className="w-full">
            {mutationError ? (
              <div
                className="mx-auto mb-4 max-w-[640px] rounded-[8px] border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                {mutationError}
              </div>
            ) : null}

            <CandidateSwipeStack
              candidate={currentCandidate}
              nextCandidate={nextCandidate}
              isProcessing={reviewMutation.isPending}
              onDecision={handleDecision}
            />

            <div className="mx-auto w-full max-w-[640px] -translate-y-[96px]">
              <CandidateSwipeActions
                disabled={reviewMutation.isPending}
                onApprove={() => {
                  handleDecision("approve");
                }}
                onReject={() => {
                  handleDecision("reject");
                }}
                onReviewLater={() => {
                  handleDecision("reviewLater");
                }}
                onOpenProfile={handleOpenProfile}
              />
            </div>
          </div>
        </div>

        <CandidateDetailsPanel
          candidate={currentCandidate}
          experiences={experiencesQuery.data}
          experienceSupported={experiencesQuery.isSupported}
          notes={notesQuery.data}
          notesSupported={notesQuery.isSupported}
          activeTab={activeTab}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
          }}
          onTabChange={(tab) => {
            setIsDetailsOpen(true);
            setActiveTab(tab);
          }}
        />
      </div>
    </div>
  );
}

export { CandidateSwipePage };
