import { z } from "zod";
import { positionStatusEnum } from "./position.schema";

export const CreatePositionDto = z.object({
  title: z.string().min(1).max(120),
  description: z.string().nullable().optional(),
});

export type CreatePosition = z.infer<typeof CreatePositionDto>;

export const UpdatePositionDto = z
  .object({
    title: z.string().min(1).max(120).optional(),
    description: z.string().nullable().optional(),
  })
  .refine(
    (data) => data.title !== undefined || data.description !== undefined,
    {
      message: "At least one field (title or description) must be provided",
    },
  );

export type UpdatePosition = z.infer<typeof UpdatePositionDto>;

export const PositionParamsDto = z.object({
  id: z.uuid(),
});

export type PositionParams = z.infer<typeof PositionParamsDto>;

export const TeamPositionsParamsDto = z.object({
  teamId: z.uuid(),
});

export type TeamPositionsParams = z.infer<typeof TeamPositionsParamsDto>;

export const ListPositionsQueryDto = z.object({
  includesClosed: z.enum(["true", "false"]).optional(),
});

export type ListPositionsQuery = z.infer<typeof ListPositionsQueryDto>;

export const UpdatePositionStatusDto = z.object({
  status: z
    .string()
    .transform((v) => v.toUpperCase())
    .pipe(z.enum(positionStatusEnum.enumValues)),
});

export type UpdatePositionStatus = z.infer<typeof UpdatePositionStatusDto>;

export const PositionResponseDto = z.object({
  id: z.uuid(),
  teamId: z.uuid(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(["OPEN", "CLOSED"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PositionResponse = z.infer<typeof PositionResponseDto>;
