import { z } from "zod";
import { candidatePositionStatusEnum } from "./candidate-position.schema";

export const CandidatePositionParamsDto = z.object({
  id: z.uuid(),
});

export type CandidatePositionParams = z.infer<
  typeof CandidatePositionParamsDto
>;

export const PositionCandidatePositionsParamsDto = z.object({
  positionId: z.uuid(),
});

export type PositionCandidatePositionsParams = z.infer<
  typeof PositionCandidatePositionsParamsDto
>;

export const CandidatePositionDecisionParamsDto = z.object({
  positionId: z.uuid(),
  candidateProfileId: z.uuid(),
});

export type CandidatePositionDecisionParams = z.infer<
  typeof CandidatePositionDecisionParamsDto
>;

export const UpdateCandidatePositionStatusDto = z.object({
  status: z
    .string()
    .transform((value) => value.toUpperCase())
    .pipe(z.enum(candidatePositionStatusEnum.enumValues)),
});

export type UpdateCandidatePositionStatus = z.infer<
  typeof UpdateCandidatePositionStatusDto
>;

export const CandidatePositionResponseDto = z.object({
  id: z.uuid(),
  positionId: z.uuid(),
  candidateProfileId: z.uuid(),
  status: z.enum(candidatePositionStatusEnum.enumValues),
  decidedByUserId: z.uuid().nullable(),
  decidedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CandidatePositionResponse = z.infer<
  typeof CandidatePositionResponseDto
>;

export const CandidatePositionHistoryResponseDto = z.object({
  id: z.uuid(),
  candidatePositionId: z.uuid(),
  fromStatus: z.enum(candidatePositionStatusEnum.enumValues).nullable(),
  toStatus: z.enum(candidatePositionStatusEnum.enumValues),
  changedByUserId: z.uuid(),
  createdAt: z.string(),
});

export type CandidatePositionHistoryResponse = z.infer<
  typeof CandidatePositionHistoryResponseDto
>;
