type CandidateRecommendationErrorCode =
  | "CANDIDATE_RECOMMENDATION_NOT_FOUND"
  | "POSITION_NOT_OPEN"
  | "CANDIDATE_RECOMMENDATION_ALREADY_EXISTS"
  | "CANDIDATE_ALREADY_IN_POSITION"
  | "INVALID_RECOMMENDATION_STATUS_TRANSITION"
  | "CANDIDATE_RECOMMENDATION_ALREADY_PROCESSED"
  | "CANDIDATE_RECOMMENDATION_ACCESS_DENIED"
  | "CANDIDATE_RECOMMENDATION_SCORE_INVALID";

type CandidateRecommendationServiceError = {
  statusCode: number;
  code: CandidateRecommendationErrorCode;
  message: string;
};

const throwCandidateRecommendationError = (
  statusCode: number,
  code: CandidateRecommendationErrorCode,
  message: string,
): never => {
  throw { statusCode, code, message } satisfies CandidateRecommendationServiceError;
};

export const candidateRecommendationErrors = {
  notFound: () =>
    throwCandidateRecommendationError(
      404,
      "CANDIDATE_RECOMMENDATION_NOT_FOUND",
      "Candidate recommendation not found",
    ),
  positionNotOpen: () =>
    throwCandidateRecommendationError(
      409,
      "POSITION_NOT_OPEN",
      "Position must be OPEN to receive new recommendations",
    ),
  alreadyExists: () =>
    throwCandidateRecommendationError(
      409,
      "CANDIDATE_RECOMMENDATION_ALREADY_EXISTS",
      "Candidate recommendation already exists for this position",
    ),
  candidateAlreadyInPosition: () =>
    throwCandidateRecommendationError(
      409,
      "CANDIDATE_ALREADY_IN_POSITION",
      "Candidate is already in the hiring process for this position",
    ),
  invalidTransition: (fromStatus: string, toStatus: string) =>
    throwCandidateRecommendationError(
      409,
      "INVALID_RECOMMENDATION_STATUS_TRANSITION",
      `Candidate recommendation cannot transition from ${fromStatus} to ${toStatus}`,
    ),
  alreadyProcessed: () =>
    throwCandidateRecommendationError(
      409,
      "CANDIDATE_RECOMMENDATION_ALREADY_PROCESSED",
      "Candidate recommendation has already been processed",
    ),
  accessDenied: () =>
    throwCandidateRecommendationError(
      403,
      "CANDIDATE_RECOMMENDATION_ACCESS_DENIED",
      "User does not have access to this recommendation",
    ),
  scoreInvalid: () =>
    throwCandidateRecommendationError(
      400,
      "CANDIDATE_RECOMMENDATION_SCORE_INVALID",
      "Candidate recommendation score must be between 0 and 100",
    ),
};

export const isCandidateRecommendationServiceError = (
  err: unknown,
): err is CandidateRecommendationServiceError =>
  typeof err === "object" &&
  err !== null &&
  "statusCode" in err &&
  "code" in err &&
  "message" in err;
