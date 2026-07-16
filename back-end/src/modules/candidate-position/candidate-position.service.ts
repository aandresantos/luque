import { conflict, notFound } from "infrastructure/middleware";
import { candidatePositionRepository } from "./candidate-position.repository";
import { type CandidatePositionStatus } from "./candidate-position.schema";
import { isUniqueViolation } from "shared/error";

const decisionStatuses = new Set<CandidatePositionStatus>([
  "SHORTLISTED",
  "DISCARDED",
]);

const validTransitions: Record<
  CandidatePositionStatus,
  ReadonlySet<CandidatePositionStatus>
> = {
  SHORTLISTED: new Set(["REVIEW_LATER", "UNDER_REVIEW", "DISCARDED"]),
  REVIEW_LATER: new Set(["UNDER_REVIEW", "DISCARDED"]),
  DISCARDED: new Set(),
  UNDER_REVIEW: new Set(["INTERVIEW", "REJECTED"]),
  INTERVIEW: new Set(["OFFER", "REJECTED"]),
  OFFER: new Set(["HIRED", "REJECTED"]),
  HIRED: new Set(),
  REJECTED: new Set(),
};

const isValidTransition = (
  fromStatus: CandidatePositionStatus,
  toStatus: CandidatePositionStatus,
): boolean => validTransitions[fromStatus].has(toStatus);

const assertRelationCanBeCreated = async (
  positionId: string,
  candidateProfileId: string,
) => {
  const [position, candidateProfile] = await Promise.all([
    candidatePositionRepository.findPositionById(positionId),
    candidatePositionRepository.findCandidateProfileById(candidateProfileId),
  ]);

  if (!position) return notFound("Position must exist");

  if (!candidateProfile) return notFound("Candidate profile must exist");

  if (position.status !== "OPEN") {
    return conflict("Position must be OPEN to receive new candidate positions");
  }

  if (candidateProfile.status !== "ACTIVE") {
    return conflict(
      "Candidate profile must be ACTIVE to be linked to a position",
    );
  }
};

const updateDecisionStatus = async (
  positionId: string,
  candidateProfileId: string,
  status: "SHORTLISTED" | "DISCARDED",
  userId: string,
) => {
  const existing =
    await candidatePositionRepository.findByPositionAndCandidateProfileId(
      positionId,
      candidateProfileId,
    );

  if (!existing) {
    await assertRelationCanBeCreated(positionId, candidateProfileId);

    try {
      return await candidatePositionRepository.createWithHistory({
        positionId,
        candidateProfileId,
        status,
        userId,
      });
    } catch (err) {
      if (!isUniqueViolation(err)) {
        throw err;
      }

      const concurrent =
        await candidatePositionRepository.findByPositionAndCandidateProfileId(
          positionId,
          candidateProfileId,
        );

      if (!concurrent) {
        throw err;
      }

      if (concurrent.status === status) {
        return concurrent;
      }

      return conflict("Candidate position already has a conflicting decision");
    }
  }

  if (existing.status === status) {
    return existing;
  }

  if (!isValidTransition(existing.status, status)) {
    return conflict(
      `Candidate position cannot transition from ${existing.status} to ${status}`,
    );
  }

  return candidatePositionRepository.updateStatusWithHistory({
    candidatePositionId: existing.id,
    fromStatus: existing.status,
    toStatus: status,
    userId,
    updates: {
      decidedByUserId: userId,
      decidedAt: new Date(),
    },
  });
};

export const candidatePositionService = {
  listCandidatePositionsByPosition: async (positionId: string) => {
    const position =
      await candidatePositionRepository.findPositionById(positionId);
    if (!position) return notFound("Position");
    return candidatePositionRepository.findByPositionId(positionId);
  },

  getCandidatePosition: async (id: string) => {
    const candidatePosition = await candidatePositionRepository.findById(id);
    if (!candidatePosition) return notFound("Candidate position");
    return candidatePosition;
  },

  selectCandidateForPosition: async (
    positionId: string,
    candidateProfileId: string,
    userId: string,
  ) =>
    updateDecisionStatus(positionId, candidateProfileId, "SHORTLISTED", userId),

  discardCandidateForPosition: async (
    positionId: string,
    candidateProfileId: string,
    userId: string,
  ) =>
    updateDecisionStatus(positionId, candidateProfileId, "DISCARDED", userId),

  updateCandidatePositionStatus: async (
    id: string,
    status: CandidatePositionStatus,
    userId: string,
  ) => {
    const candidatePosition = await candidatePositionRepository.findById(id);
    if (!candidatePosition) return notFound("Candidate position");

    if (candidatePosition.status === status) {
      return candidatePosition;
    }

    if (decisionStatuses.has(status)) {
      return conflict(
        "Use the select or discard endpoints to set candidate decision statuses",
      );
    }

    if (!isValidTransition(candidatePosition.status, status)) {
      return conflict(
        `Candidate position cannot transition from ${candidatePosition.status} to ${status}`,
      );
    }

    return candidatePositionRepository.updateStatusWithHistory({
      candidatePositionId: id,
      fromStatus: candidatePosition.status,
      toStatus: status,
      userId,
    });
  },

  getCandidatePositionHistory: async (id: string) => {
    const candidatePosition = await candidatePositionRepository.findById(id);
    if (!candidatePosition) return notFound("Candidate position");
    return candidatePositionRepository.findHistoryByCandidatePositionId(id);
  },
};
