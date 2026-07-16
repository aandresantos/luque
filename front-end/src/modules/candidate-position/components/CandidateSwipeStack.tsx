import { useEffect, useMemo, useRef, useState } from "react";
import { CandidateSwipeCard } from "./CandidateSwipeCard";
import type { CandidateForSwipe, CandidateReviewAction } from "../types";

type SwipeDirection = "left" | "right" | "up" | null;

type CandidateSwipeStackProps = {
  candidate: CandidateForSwipe;
  nextCandidate?: CandidateForSwipe;
  isProcessing: boolean;
  onDecision: (action: CandidateReviewAction) => void;
};

const SWIPE_THRESHOLD = 140;

function CandidateSwipeStack({
  candidate,
  isProcessing,
  nextCandidate,
  onDecision,
}: CandidateSwipeStackProps) {
  const startXRef = useRef<number | null>(null);
  const [offsetX, setOffsetX] = useState(0);

  useEffect(() => {
    setOffsetX(0);
    startXRef.current = null;
  }, [candidate.candidatePositionId]);

  const rotation = useMemo(() => offsetX / 28, [offsetX]);

  function resetCardPosition() {
    setOffsetX(0);
    startXRef.current = null;
  }

  function handleDecision(direction: SwipeDirection) {
    if (direction === "left") {
      onDecision("reject");
      return;
    }

    if (direction === "right") {
      onDecision("approve");
    }
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (isProcessing) {
      return;
    }

    startXRef.current = event.clientX;
    if ("setPointerCapture" in event.currentTarget) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (isProcessing || startXRef.current === null) {
      return;
    }

    setOffsetX(event.clientX - startXRef.current);
  }

  function handlePointerUp() {
    if (isProcessing || startXRef.current === null) {
      return;
    }

    if (offsetX <= -SWIPE_THRESHOLD) {
      handleDecision("left");
      return;
    }

    if (offsetX >= SWIPE_THRESHOLD) {
      handleDecision("right");
      return;
    }

    resetCardPosition();
  }

  return (
    <div className="relative flex min-h-[720px] w-full items-center justify-center px-2 py-6 sm:px-6">
      {nextCandidate ? (
        <div className="absolute inset-x-8 top-12 hidden justify-center lg:flex">
          <CandidateSwipeCard
            candidate={nextCandidate}
            className="pointer-events-none max-w-[620px] opacity-35"
            style={{ transform: "translateY(14px) scale(0.98)" }}
          />
        </div>
      ) : null}

      <div
        className="relative z-10 w-full max-w-[640px] touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={resetCardPosition}
      >
        <CandidateSwipeCard
          candidate={candidate}
          isProcessing={isProcessing}
          style={{
            transform: `translateX(${offsetX}px) rotate(${rotation}deg)`,
            transition: isProcessing
              ? "transform 220ms ease, opacity 220ms ease"
              : startXRef.current === null
                ? "transform 180ms ease"
                : "none",
          }}
        />
      </div>
    </div>
  );
}

export { CandidateSwipeStack, SWIPE_THRESHOLD };
