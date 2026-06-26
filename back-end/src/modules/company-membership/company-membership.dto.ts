import { z } from "zod";
import {
  companyMembershipRoleEnum,
  companyMembershipStatusEnum,
} from "./company-membership.schema";

export const CreateCompanyMembershipDto = z.object({
  userId: z.uuid(),
  role: z.enum(companyMembershipRoleEnum.enumValues),
});

export type CreateCompanyMembership = z.infer<typeof CreateCompanyMembershipDto>;

export const UpdateCompanyMembershipRoleDto = z.object({
  role: z.enum(companyMembershipRoleEnum.enumValues),
});

export type UpdateCompanyMembershipRole = z.infer<
  typeof UpdateCompanyMembershipRoleDto
>;

export const CompanyMembershipParamsDto = z.object({
  id: z.uuid(),
});

export type CompanyMembershipParams = z.infer<
  typeof CompanyMembershipParamsDto
>;

export const CompanyMembershipCompanyParamsDto = z.object({
  companyId: z.uuid(),
});

export type CompanyMembershipCompanyParams = z.infer<
  typeof CompanyMembershipCompanyParamsDto
>;

export const CompanyMembershipUserParamsDto = z.object({
  userId: z.uuid(),
});

export type CompanyMembershipUserParams = z.infer<
  typeof CompanyMembershipUserParamsDto
>;

export const ListCompanyMembershipsQueryDto = z.object({
  includeInactive: z.enum(["true", "false"]).optional(),
});

export type ListCompanyMembershipsQuery = z.infer<
  typeof ListCompanyMembershipsQueryDto
>;

export const CompanyMembershipResponseDto = z.object({
  id: z.uuid(),
  companyId: z.uuid(),
  userId: z.uuid(),
  role: z.enum(companyMembershipRoleEnum.enumValues),
  status: z.enum(companyMembershipStatusEnum.enumValues),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CompanyMembershipResponse = z.infer<
  typeof CompanyMembershipResponseDto
>;
