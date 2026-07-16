import { apiRequest } from "../../shared/api/api-request";
import type {
  CandidatePositionResponse,
  CandidateProfileResponse,
  PositionResponse,
  UpdateCandidatePositionStatusInput,
} from "./types";

export async function fetchPosition(positionId: string) {
  return apiRequest<PositionResponse>(`/positions/${positionId}`);
}

export async function fetchCandidatePositionsByPosition(positionId: string) {
  return apiRequest<CandidatePositionResponse[]>(
    `/positions/${positionId}/candidate-positions`,
  );
}

export async function fetchCandidateProfile(candidateProfileId: string) {
  return apiRequest<CandidateProfileResponse>(
    `/candidate-profiles/${candidateProfileId}`,
  );
}

export async function updateCandidatePositionStatus(
  candidatePositionId: string,
  input: UpdateCandidatePositionStatusInput,
) {
  return apiRequest<CandidatePositionResponse>(
    `/candidate-positions/${candidatePositionId}/status`,
    {
      method: "PATCH",
      body: {
        status: input.status,
      },
    },
  );
}

export async function discardCandidateForPosition(
  positionId: string,
  candidateProfileId: string,
) {
  return apiRequest<CandidatePositionResponse>(
    `/positions/${positionId}/candidates/${candidateProfileId}/discard`,
    {
      method: "POST",
    },
  );
}
