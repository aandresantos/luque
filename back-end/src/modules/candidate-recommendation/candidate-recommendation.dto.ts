import { z } from "zod";
import {
  candidateRecommendationSourceEnum,
  candidateRecommendationStatusEnum,
} from "./candidate-recommendation.schema";

export const CandidateRecommendationParamsDto = z.object({
  id: z.uuid(),
});

export type CandidateRecommendationParams = z.infer<
  typeof CandidateRecommendationParamsDto
>;

export const PositionRecommendationParamsDto = z.object({
  positionId: z.uuid(),
});

export type PositionRecommendationParams = z.infer<
  typeof PositionRecommendationParamsDto
>;

export const CreateCandidateRecommendationDto = z
  .object({
    positionId: z.uuid(),
    candidateProfileId: z.uuid(),
    source: z.enum(candidateRecommendationSourceEnum.enumValues),
    score: z.number().int().min(0).max(100).optional(),
    matchingVersion: z.string().trim().min(1).max(100).optional(),
    reason: z.string().trim().min(1).max(2000).optional(),
  })
  .strict();

export type CreateCandidateRecommendation = z.infer<
  typeof CreateCandidateRecommendationDto
>;

export const CreateCandidateRecommendationsBatchDto = z
  .object({
    positionId: z.uuid(),
    candidateProfileIds: z.array(z.uuid()).min(1),
    source: z.enum(candidateRecommendationSourceEnum.enumValues),
    matchingVersion: z.string().trim().min(1).max(100).optional(),
  })
  .strict();

export type CreateCandidateRecommendationsBatch = z.infer<
  typeof CreateCandidateRecommendationsBatchDto
>;

export const UpsertCandidateRecommendationDto = z
  .object({
    positionId: z.uuid(),
    candidateProfileId: z.uuid(),
    score: z.number().int().min(0).max(100),
    matchingVersion: z.string().trim().min(1).max(100),
    reason: z.string().trim().min(1).max(2000).optional(),
  })
  .strict();

export type UpsertCandidateRecommendation = z.infer<
  typeof UpsertCandidateRecommendationDto
>;

export const ListCandidateRecommendationsQueryDto = z
  .object({
    status: z.enum(candidateRecommendationStatusEnum.enumValues).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    cursor: z.uuid().optional(),
  })
  .strict();

export type ListCandidateRecommendationsQuery = z.infer<
  typeof ListCandidateRecommendationsQueryDto
>;

export const CandidateRecommendationResponseDto = z.object({
  id: z.uuid(),
  positionId: z.uuid(),
  candidateProfileId: z.uuid(),
  status: z.enum(candidateRecommendationStatusEnum.enumValues),
  source: z.enum(candidateRecommendationSourceEnum.enumValues),
  score: z.number().int().min(0).max(100).nullable(),
  matchingVersion: z.string().nullable(),
  reason: z.string().nullable(),
  generatedAt: z.string(),
  decidedAt: z.string().nullable(),
  decidedByMembershipId: z.uuid().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CandidateRecommendationResponse = z.infer<
  typeof CandidateRecommendationResponseDto
>;

export const CandidateRecommendationListResponseDto = z.object({
  items: z.array(CandidateRecommendationResponseDto),
  nextCursor: z.uuid().nullable(),
});

export type CandidateRecommendationListResponse = z.infer<
  typeof CandidateRecommendationListResponseDto
>;

export const CreateCandidateRecommendationsBatchResultDto = z.object({
  created: z.number().int().min(0),
  skipped: z.number().int().min(0),
  recommendationIds: z.array(z.uuid()),
});

export type CreateCandidateRecommendationsBatchResult = z.infer<
  typeof CreateCandidateRecommendationsBatchResultDto
>;

export const AcceptCandidateRecommendationResultDto = z.object({
  recommendation: CandidateRecommendationResponseDto,
  candidatePosition: z.object({
    id: z.uuid(),
    positionId: z.uuid(),
    candidateProfileId: z.uuid(),
    status: z.string(),
    decidedByUserId: z.uuid().nullable(),
    decidedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

export type AcceptCandidateRecommendationResult = z.infer<
  typeof AcceptCandidateRecommendationResultDto
>;
