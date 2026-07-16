import { z } from "zod";
import { companyStatusEnum } from "./company.schema";

const companySlugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must contain only lowercase letters, numbers, and hyphens",
  });

export const CreateCompanyDto = z.object({
  name: z.string().min(1).max(120),
  slug: companySlugSchema,
  description: z.string().nullable().optional(),
  logoUrl: z.url().nullable().optional(),
});

export type CreateCompany = z.infer<typeof CreateCompanyDto>;

export const UpdateCompanyDto = z
  .object({
    name: z.string().min(1).max(120).optional(),
    slug: companySlugSchema.optional(),
    description: z.string().nullable().optional(),
    logoUrl: z.url().nullable().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.slug !== undefined ||
      data.description !== undefined ||
      data.logoUrl !== undefined,
    {
      message:
        "At least one field (name, slug, description, or logoUrl) must be provided",
    },
  );

export type UpdateCompany = z.infer<typeof UpdateCompanyDto>;

export const CompanyParamsDto = z.object({
  id: z.uuid(),
});

export type CompanyParams = z.infer<typeof CompanyParamsDto>;

export const ListCompaniesQueryDto = z.object({
  includeArchived: z.enum(["true", "false"]).optional(),
});

export type ListCompaniesQuery = z.infer<typeof ListCompaniesQueryDto>;

export const CompanyResponseDto = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  logoUrl: z.string().nullable(),
  status: z.enum(companyStatusEnum.enumValues),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CompanyResponse = z.infer<typeof CompanyResponseDto>;

// criar company address,
// adicionar cnpj, razao social, segmento, nome fantasia, phone
