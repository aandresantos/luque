import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { ApiError } from "../../../shared/api/api-error";
import {
  fetchCandidatePositionsByPosition,
  fetchCandidateProfile,
  fetchPosition,
} from "../api";
import type {
  CandidateForSwipe,
  CandidatePositionResponse,
  CandidateProfileResponse,
} from "../types";

export const candidatePositionKeys = {
  all: ["candidate-positions"] as const,
  byPosition: (positionId: string) =>
    [...candidatePositionKeys.all, "position", positionId] as const,
  pendingByPosition: (positionId: string) =>
    [...candidatePositionKeys.byPosition(positionId), "pending"] as const,
  notes: (candidatePositionId: string) =>
    [...candidatePositionKeys.all, candidatePositionId, "notes"] as const,
};

export const candidateKeys = {
  all: ["candidates"] as const,
  experiences: (candidateId: string) =>
    [...candidateKeys.all, candidateId, "experiences"] as const,
};

const pendingStatuses = new Set(["SHORTLISTED", "REVIEW_LATER"]);

function mapAvailabilityStatus(
  value: CandidateProfileResponse["availabilityStatus"],
) {
  if (value === "OPEN_TO_WORK") {
    return "Open to work";
  }

  if (value === "NOT_LOOKING") {
    return "Not looking";
  }

  return null;
}

function buildCandidateForSwipe(
  candidatePosition: CandidatePositionResponse,
  candidateProfile: CandidateProfileResponse,
  positionTitle: string,
): CandidateForSwipe {
  return {
    candidatePositionId: candidatePosition.id,
    candidateProfileId: candidateProfile.id,
    status: candidatePosition.status,
    candidate: {
      id: candidateProfile.id,
      name: candidateProfile.fullName,
      headline: candidateProfile.headline,
      summary: candidateProfile.summary,
      location: candidateProfile.location,
      avatarUrl: candidateProfile.photoUrl,
      experienceYears: null,
      availability: mapAvailabilityStatus(candidateProfile.availabilityStatus),
      salaryExpectation: null,
      matchPercentage: null,
      skills: [],
    },
    position: {
      id: candidatePosition.positionId,
      title: positionTitle,
    },
  };
}

export function usePendingCandidates(positionId: string | undefined) {
  const hasValidPositionId = Boolean(positionId);

  const positionQuery = useQuery({
    queryKey: ["positions", positionId],
    queryFn: () => fetchPosition(positionId as string),
    enabled: hasValidPositionId,
    retry: false,
  });

  const candidatePositionsQuery = useQuery({
    queryKey: candidatePositionKeys.byPosition(positionId ?? ""),
    queryFn: () => fetchCandidatePositionsByPosition(positionId as string),
    enabled: hasValidPositionId,
    retry: false,
  });

  const pendingCandidatePositions = useMemo(
    () =>
      (candidatePositionsQuery.data ?? []).filter((candidatePosition) =>
        pendingStatuses.has(candidatePosition.status),
      ),
    [candidatePositionsQuery.data],
  );

  const candidateProfileQueries = useQueries({
    queries: pendingCandidatePositions.map((candidatePosition) => ({
      queryKey: ["candidate-profiles", candidatePosition.candidateProfileId],
      queryFn: () =>
        fetchCandidateProfile(candidatePosition.candidateProfileId),
      enabled: hasValidPositionId,
      retry: false,
    })),
  });

  const candidateProfilesError = candidateProfileQueries.find(
    (query) => query.error,
  )?.error;
  const isLoadingCandidateProfiles =
    candidateProfileQueries.length > 0 &&
    candidateProfileQueries.some((query) => query.isLoading || query.isPending);

  const candidates = useMemo(() => {
    if (!positionQuery.data) {
      return [];
    }

    if (candidateProfileQueries.some((query) => !query.data)) {
      return [];
    }

    return pendingCandidatePositions.map((candidatePosition, index) =>
      buildCandidateForSwipe(
        candidatePosition,
        candidateProfileQueries[index].data as CandidateProfileResponse,
        positionQuery.data.title,
      ),
    );
  }, [candidateProfileQueries, pendingCandidatePositions, positionQuery.data]);

  const error =
    (positionQuery.error as ApiError | null) ??
    (candidatePositionsQuery.error as ApiError | null) ??
    (candidateProfilesError as ApiError | null) ??
    null;

  return {
    position: positionQuery.data ?? null,
    candidates,
    totalCandidatePositions: candidatePositionsQuery.data?.length ?? 0,
    pendingCount: pendingCandidatePositions.length,
    isLoading:
      positionQuery.isLoading ||
      positionQuery.isPending ||
      candidatePositionsQuery.isLoading ||
      candidatePositionsQuery.isPending ||
      isLoadingCandidateProfiles,
    error,
  };
}
