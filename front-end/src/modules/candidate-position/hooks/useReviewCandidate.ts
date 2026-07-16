import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  discardCandidateForPosition,
  updateCandidatePositionStatus,
} from "../api";
import { candidatePositionKeys } from "./usePendingCandidates";
import type { CandidateReviewAction } from "../types";

type ReviewCandidateInput = {
  action: CandidateReviewAction;
  positionId: string;
  candidatePositionId: string;
  candidateProfileId: string;
};

export function useReviewCandidate(positionId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ReviewCandidateInput) => {
      if (input.action === "reject") {
        return discardCandidateForPosition(
          input.positionId,
          input.candidateProfileId,
        );
      }

      if (input.action === "reviewLater") {
        return updateCandidatePositionStatus(input.candidatePositionId, {
          status: "REVIEW_LATER",
        });
      }

      return updateCandidatePositionStatus(input.candidatePositionId, {
        status: "UNDER_REVIEW",
      });
    },
    onSuccess: async () => {
      if (!positionId) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: candidatePositionKeys.byPosition(positionId),
      });
    },
  });
}
