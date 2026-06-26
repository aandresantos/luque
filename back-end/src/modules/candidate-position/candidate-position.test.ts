/// <reference types="vitest/globals" />

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  candidatePositionRepository,
  type CandidatePositionRow,
  type CandidateProfileRow,
  type PositionRow,
} from "./candidate-position.repository.js";
import { candidatePositionService } from "./candidate-position.service.js";

vi.mock("./candidate-position.repository");

const makeCandidatePosition = (
  overrides: Partial<CandidatePositionRow> = {},
): CandidatePositionRow => ({
  id: "candidate-position-1",
  positionId: "position-1",
  candidateProfileId: "candidate-profile-1",
  status: "SHORTLISTED",
  decidedByUserId: "user-1",
  decidedAt: new Date("2024-01-01T00:00:00.000Z"),
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  ...overrides,
});

const makePosition = (overrides: Partial<PositionRow> = {}): PositionRow => ({
  id: "position-1",
  teamId: "team-1",
  title: "Backend Engineer",
  description: "Platform work",
  status: "OPEN",
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  ...overrides,
});

const makeCandidateProfile = (
  overrides: Partial<CandidateProfileRow> = {},
): CandidateProfileRow => ({
  id: "candidate-profile-1",
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

describe("candidatePositionService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("selectCandidateForPosition", () => {
    it("creates a candidate position when the relation is valid and does not exist", async () => {
      const created = makeCandidatePosition();

      vi.mocked(
        candidatePositionRepository.findByPositionAndCandidateProfileId,
      ).mockResolvedValue(undefined);
      vi.mocked(candidatePositionRepository.findPositionById).mockResolvedValue(
        makePosition(),
      );
      vi.mocked(
        candidatePositionRepository.findCandidateProfileById,
      ).mockResolvedValue(makeCandidateProfile());
      vi.mocked(
        candidatePositionRepository.createWithHistory,
      ).mockResolvedValue(created);

      const result = await candidatePositionService.selectCandidateForPosition(
        "position-1",
        "candidate-profile-1",
        "user-1",
      );

      expect(result).toEqual(created);
      expect(
        candidatePositionRepository.createWithHistory,
      ).toHaveBeenCalledWith({
        positionId: "position-1",
        candidateProfileId: "candidate-profile-1",
        status: "SHORTLISTED",
        userId: "user-1",
      });
    });

    it("returns the existing relation without writing history when already shortlisted", async () => {
      const existing = makeCandidatePosition();

      vi.mocked(
        candidatePositionRepository.findByPositionAndCandidateProfileId,
      ).mockResolvedValue(existing);

      const result = await candidatePositionService.selectCandidateForPosition(
        "position-1",
        "candidate-profile-1",
        "user-1",
      );

      expect(result).toEqual(existing);
      expect(
        candidatePositionRepository.createWithHistory,
      ).not.toHaveBeenCalled();
      expect(
        candidatePositionRepository.updateStatusWithHistory,
      ).not.toHaveBeenCalled();
    });

    it("returns the concurrent relation when a duplicate create races to the same decision", async () => {
      const concurrent = makeCandidatePosition();

      vi.mocked(candidatePositionRepository.findByPositionAndCandidateProfileId)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(concurrent);
      vi.mocked(candidatePositionRepository.findPositionById).mockResolvedValue(
        makePosition(),
      );
      vi.mocked(
        candidatePositionRepository.findCandidateProfileById,
      ).mockResolvedValue(makeCandidateProfile());
      vi.mocked(
        candidatePositionRepository.createWithHistory,
      ).mockRejectedValue({
        code: "23505",
      });

      const result = await candidatePositionService.selectCandidateForPosition(
        "position-1",
        "candidate-profile-1",
        "user-1",
      );

      expect(result).toEqual(concurrent);
    });

    it("rejects selecting a discarded candidate position", async () => {
      vi.mocked(
        candidatePositionRepository.findByPositionAndCandidateProfileId,
      ).mockResolvedValue(makeCandidatePosition({ status: "DISCARDED" }));

      await expect(
        candidatePositionService.selectCandidateForPosition(
          "position-1",
          "candidate-profile-1",
          "user-1",
        ),
      ).rejects.toMatchObject({
        statusCode: 409,
        message:
          "Candidate position cannot transition from DISCARDED to SHORTLISTED",
      });
    });
  });

  describe("discardCandidateForPosition", () => {
    it("moves a shortlisted relation to discarded and records the decision metadata", async () => {
      const updated = makeCandidatePosition({
        status: "DISCARDED",
        decidedByUserId: "user-2",
      });

      vi.mocked(
        candidatePositionRepository.findByPositionAndCandidateProfileId,
      ).mockResolvedValue(makeCandidatePosition());
      vi.mocked(
        candidatePositionRepository.updateStatusWithHistory,
      ).mockResolvedValue(updated);

      const result = await candidatePositionService.discardCandidateForPosition(
        "position-1",
        "candidate-profile-1",
        "user-2",
      );

      expect(result).toEqual(updated);
      expect(
        candidatePositionRepository.updateStatusWithHistory,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          candidatePositionId: "candidate-position-1",
          fromStatus: "SHORTLISTED",
          toStatus: "DISCARDED",
          userId: "user-2",
          updates: expect.objectContaining({
            decidedByUserId: "user-2",
            decidedAt: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe("updateCandidatePositionStatus", () => {
    it("moves a candidate position through a valid pipeline transition", async () => {
      const updated = makeCandidatePosition({ status: "UNDER_REVIEW" });

      vi.mocked(candidatePositionRepository.findById).mockResolvedValue(
        makeCandidatePosition(),
      );
      vi.mocked(
        candidatePositionRepository.updateStatusWithHistory,
      ).mockResolvedValue(updated);

      const result =
        await candidatePositionService.updateCandidatePositionStatus(
          "candidate-position-1",
          "UNDER_REVIEW",
          "user-1",
        );

      expect(result).toEqual(updated);
      expect(
        candidatePositionRepository.updateStatusWithHistory,
      ).toHaveBeenCalledWith({
        candidatePositionId: "candidate-position-1",
        fromStatus: "SHORTLISTED",
        toStatus: "UNDER_REVIEW",
        userId: "user-1",
      });
    });

    it("rejects decision statuses on the generic status endpoint", async () => {
      vi.mocked(candidatePositionRepository.findById).mockResolvedValue(
        makeCandidatePosition(),
      );

      await expect(
        candidatePositionService.updateCandidatePositionStatus(
          "candidate-position-1",
          "DISCARDED",
          "user-1",
        ),
      ).rejects.toMatchObject({
        statusCode: 409,
        message:
          "Use the select or discard endpoints to set candidate decision statuses",
      });
    });

    it("returns the already-updated row when a concurrent transition reaches the same target first", async () => {
      const updated = makeCandidatePosition({ status: "UNDER_REVIEW" });

      vi.mocked(candidatePositionRepository.findById)
        .mockResolvedValueOnce(makeCandidatePosition())
        .mockResolvedValueOnce(updated);
      vi.mocked(
        candidatePositionRepository.updateStatusWithHistory,
      ).mockResolvedValue(undefined);

      const result =
        await candidatePositionService.updateCandidatePositionStatus(
          "candidate-position-1",
          "UNDER_REVIEW",
          "user-1",
        );

      expect(result).toEqual(updated);
    });
  });

  describe("getCandidatePositionHistory", () => {
    it("throws 404 when the candidate position does not exist", async () => {
      vi.mocked(candidatePositionRepository.findById).mockResolvedValue(
        undefined,
      );

      await expect(
        candidatePositionService.getCandidatePositionHistory(
          "candidate-position-1",
        ),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Candidate position not found",
      });
    });
  });
});
