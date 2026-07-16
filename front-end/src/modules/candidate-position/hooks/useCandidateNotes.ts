import { useQuery } from "@tanstack/react-query";
import { candidatePositionKeys } from "./usePendingCandidates";
import type { CandidatePositionNote } from "../types";

export function useCandidateNotes(
  candidatePositionId: string | undefined,
  enabled: boolean,
) {
  const query = useQuery<CandidatePositionNote[]>({
    queryKey: candidatePositionKeys.notes(candidatePositionId ?? ""),
    queryFn: async () => [],
    enabled: false && enabled && Boolean(candidatePositionId),
    retry: false,
  });

  return {
    ...query,
    data: query.data ?? [],
    isSupported: false,
  };
}
