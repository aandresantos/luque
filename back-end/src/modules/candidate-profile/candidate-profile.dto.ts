import { z } from "zod";
import {
  candidateProfileAvailabilityStatusEnum,
  candidateProfileSeniorityEnum,
  candidateProfileStatusEnum,
} from "./candidate-profile.schema.js";

const fullNameSchema = z.string().min(1).max(120);
const headlineSchema = z.string().max(255);
const locationSchema = z.string().max(120);
const photoUrlSchema = z.url();

export const CreateCandidateProfileDto = z.object({
  fullName: fullNameSchema,
  headline: headlineSchema.nullable().optional(),
  summary: z.string().nullable().optional(),
  location: locationSchema.nullable().optional(),
  photoUrl: photoUrlSchema.nullable().optional(),
  seniority: z
    .enum(candidateProfileSeniorityEnum.enumValues)
    .nullable()
    .optional(),
  availabilityStatus: z
    .enum(candidateProfileAvailabilityStatusEnum.enumValues)
    .optional(),
});

export type CreateCandidateProfile = z.infer<typeof CreateCandidateProfileDto>;

export const UpdateCurrentCandidateProfileDto = z
  .object({
    fullName: fullNameSchema.optional(),
    headline: headlineSchema.nullable().optional(),
    summary: z.string().nullable().optional(),
    location: locationSchema.nullable().optional(),
    photoUrl: photoUrlSchema.nullable().optional(),
    seniority: z
      .enum(candidateProfileSeniorityEnum.enumValues)
      .nullable()
      .optional(),
    availabilityStatus: z
      .enum(candidateProfileAvailabilityStatusEnum.enumValues)
      .optional(),
  })
  .refine(
    (data) =>
      data.fullName !== undefined ||
      data.headline !== undefined ||
      data.summary !== undefined ||
      data.location !== undefined ||
      data.photoUrl !== undefined ||
      data.seniority !== undefined ||
      data.availabilityStatus !== undefined,
    {
      message:
        "At least one field must be provided to update the candidate profile",
    },
  );

export type UpdateCurrentCandidateProfile = z.infer<
  typeof UpdateCurrentCandidateProfileDto
>;

export const CandidateProfileParamsDto = z.object({
  id: z.uuid(),
});

export type CandidateProfileParams = z.infer<typeof CandidateProfileParamsDto>;

export const CandidateProfileResponseDto = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  fullName: z.string(),
  headline: z.string().nullable(),
  summary: z.string().nullable(),
  location: z.string().nullable(),
  photoUrl: z.string().url().nullable(),
  seniority: z.enum(candidateProfileSeniorityEnum.enumValues).nullable(),
  availabilityStatus: z.enum(
    candidateProfileAvailabilityStatusEnum.enumValues,
  ),
  status: z.enum(candidateProfileStatusEnum.enumValues),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CandidateProfileResponse = z.infer<
  typeof CandidateProfileResponseDto
>;
