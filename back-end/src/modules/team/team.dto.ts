import { z } from "zod";

export const CreateTeamDto = z.object({
  name: z.string().min(1).max(120),
  description: z.string().nullable().optional(),
});

export type CreateTeam = z.infer<typeof CreateTeamDto>;

export const UpdateTeamDto = z
  .object({
    name: z.string().min(1).max(120).optional(),
    description: z.string().nullable().optional(),
  })
  .refine(
    (data) => data.name !== undefined || data.description !== undefined,
    {
      message: "At least one field (name or description) must be provided",
    },
  );

export type UpdateTeam = z.infer<typeof UpdateTeamDto>;

export const TeamParamsDto = z.object({
  id: z.uuid(),
});

export type TeamParams = z.infer<typeof TeamParamsDto>;

export const CompanyTeamsParamsDto = z.object({
  companyId: z.uuid(),
});

export type CompanyTeamsParams = z.infer<typeof CompanyTeamsParamsDto>;

export const ListTeamsQueryDto = z.object({
  includeArchived: z.enum(["true", "false"]).optional(),
});

export type ListTeamsQuery = z.infer<typeof ListTeamsQueryDto>;

export const TeamResponseDto = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.enum(["ACTIVE", "ARCHIVED"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TeamResponse = z.infer<typeof TeamResponseDto>;
