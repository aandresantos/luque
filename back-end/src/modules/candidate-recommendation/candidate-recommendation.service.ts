import { conflict, notFound } from "../../infrasctructure/middleware";
import { isUniqueViolation } from "../../shared/error";
import type {
  CreateCandidateRecommendation,
  CreateCandidateRecommendationsBatch,
  ListCandidateRecommendationsQuery,
  UpsertCandidateRecommendation,
} from "./candidate-recommendation.dto";
import { candidateRecommendationErrors } from "./candidate-recommendation.errors";
import {
  candidateRecommendationRepository,
  type CandidatePositionRow,
  type CandidateRecommendationRow,
  type MembershipRow,
  type PositionAccessContext,
} from "./candidate-recommendation.repository";

const allowedDecisionRoles = new Set(["ADMIN", "RECRUITER", "RECRUITER_MANAGER"]);

const allowedTransitions: Record<
  CandidateRecommendationRow["status"],
  ReadonlySet<CandidateRecommendationRow["status"]>
> = {
  PENDING: new Set(["ACCEPTED", "REJECTED", "REVIEW_LATER"]),
  REVIEW_LATER: new Set(["ACCEPTED", "REJECTED", "PENDING"]),
  ACCEPTED: new Set(),
  REJECTED: new Set(),
};

const assertAuthorizedMembership = (
  membership: MembershipRow | undefined,
): MembershipRow => {
  if (!membership || !allowedDecisionRoles.has(membership.role)) {
    return candidateRecommendationErrors.accessDenied();
  }

  return membership;
};

const assertPositionIsOpen = (position: PositionAccessContext): void => {
  if (position.status !== "OPEN") {
    candidateRecommendationErrors.positionNotOpen();
  }
};

const assertTransitionAllowed = (
  fromStatus: CandidateRecommendationRow["status"],
  toStatus: CandidateRecommendationRow["status"],
): void => {
  if (!allowedTransitions[fromStatus].has(toStatus)) {
    candidateRecommendationErrors.invalidTransition(fromStatus, toStatus);
  }
};

const getPositionAndMembership = async (positionId: string, userId: string) => {
  const position =
    await candidateRecommendationRepository.findPositionAccessContextById(
      positionId,
    );

  if (!position) {
    return notFound("Position");
  }

  const membership = await candidateRecommendationRepository.findMembershipForCompanyUser(
    position.companyId,
    userId,
  );

  return {
    position,
    membership: assertAuthorizedMembership(membership),
  };
};

const getRecommendationActorContext = async (
  recommendationId: string,
  userId: string,
): Promise<{
  recommendation: CandidateRecommendationRow;
  position: PositionAccessContext;
  membership: MembershipRow;
}> => {
  const recommendation = await candidateRecommendationRepository.findById(
    recommendationId,
  );

  if (!recommendation) {
    return candidateRecommendationErrors.notFound();
  }

  const position =
    await candidateRecommendationRepository.findPositionAccessContextById(
      recommendation.positionId,
    );

  if (!position) {
    return notFound("Position");
  }

  const membership = await candidateRecommendationRepository.findMembershipForCompanyUser(
    position.companyId,
    userId,
  );

  return {
    recommendation,
    position,
    membership: assertAuthorizedMembership(membership),
  };
};

const assertNoCandidatePosition = (
  candidatePosition: CandidatePositionRow | undefined,
): void => {
  if (candidatePosition) {
    candidateRecommendationErrors.candidateAlreadyInPosition();
  }
};

const assertCandidateProfileCanEnterProcess = (
  candidateProfile: { status: string } | undefined,
): void => {
  if (!candidateProfile) {
    return notFound("Candidate profile");
  }

  if (candidateProfile.status !== "ACTIVE") {
    return conflict("Candidate profile must be ACTIVE to be linked to a position");
  }
};

export const candidateRecommendationService = {
  createRecommendation: async (
    input: CreateCandidateRecommendation,
    userId: string,
  ) => {
    const { position } = await getPositionAndMembership(input.positionId, userId);
    assertPositionIsOpen(position);

    const candidateProfile =
      await candidateRecommendationRepository.findCandidateProfileById(
        input.candidateProfileId,
      );
    if (!candidateProfile) {
      return notFound("Candidate profile");
    }

    const existing =
      await candidateRecommendationRepository.findByPositionAndCandidate(
        input.positionId,
        input.candidateProfileId,
      );
    if (existing) {
      candidateRecommendationErrors.alreadyExists();
    }

    const candidatePosition =
      await candidateRecommendationRepository.findCandidatePositionByPositionAndCandidate(
        input.positionId,
        input.candidateProfileId,
      );
    assertNoCandidatePosition(candidatePosition);

    try {
      return await candidateRecommendationRepository.create(input);
    } catch (err) {
      if (isUniqueViolation(err)) {
        candidateRecommendationErrors.alreadyExists();
      }
      throw err;
    }
  },

  createRecommendationsBatch: async (
    input: CreateCandidateRecommendationsBatch,
    userId: string,
  ) => {
    const { position } = await getPositionAndMembership(input.positionId, userId);
    assertPositionIsOpen(position);

    const uniqueCandidateProfileIds = [...new Set(input.candidateProfileIds)];

    const [candidateProfiles, existingRecommendations, existingCandidatePositions] =
      await Promise.all([
        candidateRecommendationRepository.findCandidateProfilesByIds(
          uniqueCandidateProfileIds,
        ),
        candidateRecommendationRepository.findByPositionAndCandidateIds(
          input.positionId,
          uniqueCandidateProfileIds,
        ),
        candidateRecommendationRepository.findCandidatePositionsByPositionAndCandidateIds(
          input.positionId,
          uniqueCandidateProfileIds,
        ),
      ]);

    const existingProfileIds = new Set(candidateProfiles.map((item) => item.id));
    const existingRecommendationIds = new Set(
      existingRecommendations.map((item) => item.candidateProfileId),
    );
    const existingCandidatePositionIds = new Set(
      existingCandidatePositions.map((item) => item.candidateProfileId),
    );

    const recordsToCreate = uniqueCandidateProfileIds
      .filter((candidateProfileId) => existingProfileIds.has(candidateProfileId))
      .filter(
        (candidateProfileId) =>
          !existingRecommendationIds.has(candidateProfileId) &&
          !existingCandidatePositionIds.has(candidateProfileId),
      )
      .map((candidateProfileId) => ({
        positionId: input.positionId,
        candidateProfileId,
        source: input.source,
        matchingVersion: input.matchingVersion,
      }));

    const created = await candidateRecommendationRepository.createMany(
      recordsToCreate,
    );

    return {
      created: created.length,
      skipped: uniqueCandidateProfileIds.length - created.length,
      recommendationIds: created.map((item) => item.id),
    };
  },

  listRecommendationsByPosition: async (
    positionId: string,
    query: ListCandidateRecommendationsQuery,
    userId: string,
  ) => {
    await getPositionAndMembership(positionId, userId);
    return candidateRecommendationRepository.listByPosition({
      positionId,
      status: query.status,
      limit: query.limit,
      cursor: query.cursor,
    });
  },

  getRecommendation: async (id: string, userId: string) => {
    const { recommendation } = await getRecommendationActorContext(id, userId);
    return recommendation;
  },

  acceptRecommendation: async (id: string, userId: string) => {
    try {
      try {
        return await candidateRecommendationRepository.withTransaction(
          async (tx) => {
            const recommendation =
              await candidateRecommendationRepository.lockById(id, tx);

            if (!recommendation) {
              return candidateRecommendationErrors.notFound();
            }

            const position =
              await candidateRecommendationRepository.findPositionAccessContextById(
                recommendation.positionId,
                tx,
              );

            if (!position) {
              return notFound("Position");
            }

            const membership =
              await candidateRecommendationRepository.findMembershipForCompanyUser(
                position.companyId,
                userId,
                tx,
              );

            const actorMembership = assertAuthorizedMembership(membership);

            assertPositionIsOpen(position);

            const candidateProfile =
              await candidateRecommendationRepository.findCandidateProfileById(
                recommendation.candidateProfileId,
                tx,
              );
            assertCandidateProfileCanEnterProcess(candidateProfile);

            const existingCandidatePosition =
              await candidateRecommendationRepository.findCandidatePositionByPositionAndCandidate(
                recommendation.positionId,
                recommendation.candidateProfileId,
                tx,
              );

            if (
              recommendation.status === "ACCEPTED" &&
              existingCandidatePosition
            ) {
              return {
                recommendation,
                candidatePosition: existingCandidatePosition,
              };
            }

            assertTransitionAllowed(recommendation.status, "ACCEPTED");
            assertNoCandidatePosition(existingCandidatePosition);

            const candidatePosition =
              await candidateRecommendationRepository.createCandidatePositionFromRecommendation(
                {
                  positionId: recommendation.positionId,
                  candidateProfileId: recommendation.candidateProfileId,
                  userId,
                },
                tx,
              );

            const updatedRecommendation =
              await candidateRecommendationRepository.updateDecision(
                {
                  id: recommendation.id,
                  fromStatus: recommendation.status,
                  toStatus: "ACCEPTED",
                  decidedAt: new Date(),
                  decidedByMembershipId: actorMembership.id,
                },
                tx,
              );

            if (!updatedRecommendation) {
              candidateRecommendationErrors.alreadyProcessed();
            }

            return {
              recommendation: updatedRecommendation,
              candidatePosition,
            };
          },
        );
      } catch (err) {
        if (!isUniqueViolation(err)) {
          throw err;
        }
      }

      const [recommendation, candidatePosition] = await Promise.all([
        candidateRecommendationRepository.findById(id),
        candidateRecommendationRepository.findById(id).then((existing) => {
          if (!existing) {
            return undefined;
          }

          return candidateRecommendationRepository.findCandidatePositionByPositionAndCandidate(
            existing.positionId,
            existing.candidateProfileId,
          );
        }),
      ]);

      if (recommendation?.status === "ACCEPTED" && candidatePosition) {
        return {
          recommendation,
          candidatePosition,
        };
      }

      candidateRecommendationErrors.candidateAlreadyInPosition();
    } catch (err) {
      throw err;
    }
  },

  rejectRecommendation: async (id: string, userId: string) => {
    return candidateRecommendationRepository.withTransaction(async (tx) => {
      const recommendation = await candidateRecommendationRepository.lockById(
        id,
        tx,
      );

      if (!recommendation) {
        return candidateRecommendationErrors.notFound();
      }

      const position =
        await candidateRecommendationRepository.findPositionAccessContextById(
          recommendation.positionId,
          tx,
        );

      if (!position) {
        return notFound("Position");
      }

      const membership =
        await candidateRecommendationRepository.findMembershipForCompanyUser(
          position.companyId,
          userId,
          tx,
        );
      const actorMembership = assertAuthorizedMembership(membership);

      assertTransitionAllowed(recommendation.status, "REJECTED");

      const updated = await candidateRecommendationRepository.updateDecision(
        {
          id: recommendation.id,
          fromStatus: recommendation.status,
          toStatus: "REJECTED",
          decidedAt: new Date(),
          decidedByMembershipId: actorMembership.id,
        },
        tx,
      );

      if (!updated) {
        candidateRecommendationErrors.alreadyProcessed();
      }

      return updated;
    });
  },

  reviewLaterRecommendation: async (id: string, userId: string) => {
    return candidateRecommendationRepository.withTransaction(async (tx) => {
      const recommendation = await candidateRecommendationRepository.lockById(
        id,
        tx,
      );

      if (!recommendation) {
        return candidateRecommendationErrors.notFound();
      }

      const position =
        await candidateRecommendationRepository.findPositionAccessContextById(
          recommendation.positionId,
          tx,
        );

      if (!position) {
        return notFound("Position");
      }

      const membership =
        await candidateRecommendationRepository.findMembershipForCompanyUser(
          position.companyId,
          userId,
          tx,
        );
      const actorMembership = assertAuthorizedMembership(membership);

      assertTransitionAllowed(recommendation.status, "REVIEW_LATER");

      const updated = await candidateRecommendationRepository.updateDecision(
        {
          id: recommendation.id,
          fromStatus: recommendation.status,
          toStatus: "REVIEW_LATER",
          decidedAt: new Date(),
          decidedByMembershipId: actorMembership.id,
        },
        tx,
      );

      if (!updated) {
        candidateRecommendationErrors.alreadyProcessed();
      }

      return updated;
    });
  },

  upsertFromMatching: async (input: UpsertCandidateRecommendation) => {
    const position =
      await candidateRecommendationRepository.findPositionAccessContextById(
        input.positionId,
      );

    if (!position) {
      return notFound("Position");
    }

    assertPositionIsOpen(position);

    const candidateProfile =
      await candidateRecommendationRepository.findCandidateProfileById(
        input.candidateProfileId,
      );

    if (!candidateProfile) {
      return notFound("Candidate profile");
    }

    const existingCandidatePosition =
      await candidateRecommendationRepository.findCandidatePositionByPositionAndCandidate(
        input.positionId,
        input.candidateProfileId,
      );

    if (existingCandidatePosition) {
      return undefined;
    }

    const existing =
      await candidateRecommendationRepository.findByPositionAndCandidate(
        input.positionId,
        input.candidateProfileId,
      );

    if (!existing) {
      return candidateRecommendationRepository.create({
        ...input,
        source: "MATCHING_JOB",
      });
    }

    if (existing.status === "ACCEPTED" || existing.status === "REJECTED") {
      return existing;
    }

    return candidateRecommendationRepository.updateMatchingData({
      id: existing.id,
      score: input.score,
      matchingVersion: input.matchingVersion,
      reason: input.reason,
      generatedAt: new Date(),
    });
  },
};
