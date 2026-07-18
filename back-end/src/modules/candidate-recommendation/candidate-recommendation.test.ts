/// <reference types="vitest/globals" />

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CreateCandidateRecommendationDto,
  type CreateCandidateRecommendation,
} from "./candidate-recommendation.dto";
import {
  candidateRecommendationRepository,
  type CandidatePositionRow,
  type CandidateProfileRow,
  type CandidateRecommendationRow,
  type MembershipRow,
  type PositionAccessContext,
} from "./candidate-recommendation.repository";
import { candidateRecommendationService } from "./candidate-recommendation.service";

vi.mock("./candidate-recommendation.repository");

const makePosition = (
  overrides: Partial<PositionAccessContext> = {},
): PositionAccessContext => ({
  id: "position-1",
  companyId: "company-1",
  title: "Backend Engineer",
  status: "OPEN",
  ...overrides,
});

const makeMembership = (
  overrides: Partial<MembershipRow> = {},
): MembershipRow => ({
  id: "membership-1",
  companyId: "company-1",
  userId: "user-1",
  role: "RECRUITER",
  status: "ACTIVE",
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  ...overrides,
});

const makeCandidateProfile = (
  overrides: Partial<CandidateProfileRow> = {},
): CandidateProfileRow => ({
  id: "candidate-1",
  userId: "candidate-user-1",
  fullName: "Jane Doe",
  headline: null,
  summary: null,
  location: null,
  photoUrl: null,
  seniority: null,
  availabilityStatus: "OPEN_TO_WORK",
  status: "ACTIVE",
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  ...overrides,
});

const makeRecommendation = (
  overrides: Partial<CandidateRecommendationRow> = {},
): CandidateRecommendationRow => ({
  id: "recommendation-1",
  positionId: "position-1",
  candidateProfileId: "candidate-1",
  status: "PENDING",
  source: "MANUAL",
  score: 92,
  matchingVersion: null,
  reason: null,
  generatedAt: new Date("2024-01-01T00:00:00.000Z"),
  decidedAt: null,
  decidedByMembershipId: null,
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  ...overrides,
});

const makeCandidatePosition = (
  overrides: Partial<CandidatePositionRow> = {},
): CandidatePositionRow => ({
  id: "candidate-position-1",
  positionId: "position-1",
  candidateProfileId: "candidate-1",
  status: "SHORTLISTED",
  decidedByUserId: "user-1",
  decidedAt: new Date("2024-01-01T00:00:00.000Z"),
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  ...overrides,
});

describe("CreateCandidateRecommendationDto", () => {
  it("accepts a valid payload", () => {
    const payload: CreateCandidateRecommendation = {
      positionId: "2ae3a947-5c8a-4c16-854b-4232d393a8d1",
      candidateProfileId: "da8ef3a8-31de-4b83-b5db-f2953ab4ee9d",
      source: "MANUAL",
      score: 91,
    };

    expect(CreateCandidateRecommendationDto.parse(payload)).toEqual(payload);
  });

  it("rejects score above 100", () => {
    expect(() =>
      CreateCandidateRecommendationDto.parse({
        positionId: "2ae3a947-5c8a-4c16-854b-4232d393a8d1",
        candidateProfileId: "da8ef3a8-31de-4b83-b5db-f2953ab4ee9d",
        source: "MANUAL",
        score: 101,
      }),
    ).toThrow();
  });

  it("rejects unknown status injection", () => {
    expect(() =>
      CreateCandidateRecommendationDto.parse({
        positionId: "2ae3a947-5c8a-4c16-854b-4232d393a8d1",
        candidateProfileId: "da8ef3a8-31de-4b83-b5db-f2953ab4ee9d",
        source: "MANUAL",
        status: "ACCEPTED",
      }),
    ).toThrow();
  });
});

describe("candidateRecommendationService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("createRecommendation", () => {
    it("creates a recommendation for an open position", async () => {
      const created = makeRecommendation();

      vi.mocked(
        candidateRecommendationRepository.findPositionAccessContextById,
      ).mockResolvedValue(makePosition());
      vi.mocked(
        candidateRecommendationRepository.findMembershipForCompanyUser,
      ).mockResolvedValue(makeMembership());
      vi.mocked(
        candidateRecommendationRepository.findCandidateProfileById,
      ).mockResolvedValue(makeCandidateProfile());
      vi.mocked(
        candidateRecommendationRepository.findByPositionAndCandidate,
      ).mockResolvedValue(undefined);
      vi.mocked(
        candidateRecommendationRepository.findCandidatePositionByPositionAndCandidate,
      ).mockResolvedValue(undefined);
      vi.mocked(candidateRecommendationRepository.create).mockResolvedValue(
        created,
      );

      const result = await candidateRecommendationService.createRecommendation(
        {
          positionId: "position-1",
          candidateProfileId: "candidate-1",
          source: "MANUAL",
          score: 92,
        },
        "user-1",
      );

      expect(result).toEqual(created);
    });

    it("blocks access from another company", async () => {
      vi.mocked(
        candidateRecommendationRepository.findPositionAccessContextById,
      ).mockResolvedValue(makePosition());
      vi.mocked(
        candidateRecommendationRepository.findMembershipForCompanyUser,
      ).mockResolvedValue(undefined);

      await expect(
        candidateRecommendationService.createRecommendation(
          {
            positionId: "position-1",
            candidateProfileId: "candidate-1",
            source: "MANUAL",
          },
          "user-1",
        ),
      ).rejects.toMatchObject({
        statusCode: 403,
        code: "CANDIDATE_RECOMMENDATION_ACCESS_DENIED",
      });
    });
  });

  describe("createRecommendationsBatch", () => {
    it("normalizes duplicate ids and returns created/skipped counters", async () => {
      vi.mocked(
        candidateRecommendationRepository.findPositionAccessContextById,
      ).mockResolvedValue(makePosition());
      vi.mocked(
        candidateRecommendationRepository.findMembershipForCompanyUser,
      ).mockResolvedValue(makeMembership());
      vi.mocked(
        candidateRecommendationRepository.findCandidateProfilesByIds,
      ).mockResolvedValue([
        makeCandidateProfile({ id: "candidate-1" }),
        makeCandidateProfile({ id: "candidate-2" }),
      ]);
      vi.mocked(
        candidateRecommendationRepository.findByPositionAndCandidateIds,
      ).mockResolvedValue([makeRecommendation({ candidateProfileId: "candidate-2" })]);
      vi.mocked(
        candidateRecommendationRepository.findCandidatePositionsByPositionAndCandidateIds,
      ).mockResolvedValue([]);
      vi.mocked(candidateRecommendationRepository.createMany).mockResolvedValue([
        makeRecommendation({ id: "recommendation-10", candidateProfileId: "candidate-1" }),
      ]);

      const result =
        await candidateRecommendationService.createRecommendationsBatch(
          {
            positionId: "position-1",
            candidateProfileIds: ["candidate-1", "candidate-1", "candidate-2"],
            source: "SEED",
          },
          "user-1",
        );

      expect(result).toEqual({
        created: 1,
        skipped: 1,
        recommendationIds: ["recommendation-10"],
      });
    });
  });

  describe("listRecommendationsByPosition", () => {
    it("lists recommendations using cursor pagination", async () => {
      vi.mocked(
        candidateRecommendationRepository.findPositionAccessContextById,
      ).mockResolvedValue(makePosition());
      vi.mocked(
        candidateRecommendationRepository.findMembershipForCompanyUser,
      ).mockResolvedValue(makeMembership());
      vi.mocked(candidateRecommendationRepository.listByPosition).mockResolvedValue({
        items: [makeRecommendation()],
        nextCursor: "recommendation-1",
      });

      const result =
        await candidateRecommendationService.listRecommendationsByPosition(
          "position-1",
          { limit: 20, status: "PENDING" },
          "user-1",
        );

      expect(result.items).toHaveLength(1);
      expect(result.nextCursor).toBe("recommendation-1");
    });
  });

  describe("upsertFromMatching", () => {
    it("updates review later recommendations without changing status", async () => {
      const existing = makeRecommendation({ status: "REVIEW_LATER", score: 50 });
      const updated = makeRecommendation({
        id: existing.id,
        status: "REVIEW_LATER",
        score: 88,
        matchingVersion: "v2",
      });

      vi.mocked(
        candidateRecommendationRepository.findPositionAccessContextById,
      ).mockResolvedValue(makePosition());
      vi.mocked(
        candidateRecommendationRepository.findCandidateProfileById,
      ).mockResolvedValue(makeCandidateProfile());
      vi.mocked(
        candidateRecommendationRepository.findCandidatePositionByPositionAndCandidate,
      ).mockResolvedValue(undefined);
      vi.mocked(
        candidateRecommendationRepository.findByPositionAndCandidate,
      ).mockResolvedValue(existing);
      vi.mocked(
        candidateRecommendationRepository.updateMatchingData,
      ).mockResolvedValue(updated);

      const result = await candidateRecommendationService.upsertFromMatching({
        positionId: "position-1",
        candidateProfileId: "candidate-1",
        score: 88,
        matchingVersion: "v2",
      });

      expect(result?.status).toBe("REVIEW_LATER");
      expect(result?.score).toBe(88);
    });

    it("ignores candidates already in the process", async () => {
      vi.mocked(
        candidateRecommendationRepository.findPositionAccessContextById,
      ).mockResolvedValue(makePosition());
      vi.mocked(
        candidateRecommendationRepository.findCandidateProfileById,
      ).mockResolvedValue(makeCandidateProfile());
      vi.mocked(
        candidateRecommendationRepository.findCandidatePositionByPositionAndCandidate,
      ).mockResolvedValue(makeCandidatePosition());

      const result = await candidateRecommendationService.upsertFromMatching({
        positionId: "position-1",
        candidateProfileId: "candidate-1",
        score: 88,
        matchingVersion: "v2",
      });

      expect(result).toBeUndefined();
    });
  });
});
