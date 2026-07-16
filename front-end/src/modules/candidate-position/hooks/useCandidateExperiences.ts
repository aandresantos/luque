import { useQuery } from "@tanstack/react-query";
import { candidateKeys } from "./usePendingCandidates";
import type { CandidateExperience } from "../types";

export function useCandidateExperiences(
  candidateId: string | undefined,
  enabled: boolean,
) {
  const query = useQuery<CandidateExperience[]>({
    queryKey: candidateKeys.experiences(candidateId ?? ""),
    queryFn: async () => [],
    enabled: false && enabled && Boolean(candidateId),
    retry: false,
  });

  return {
    ...query,
    data: query.data ?? [],
    isSupported: false,
  };
}
