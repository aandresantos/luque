import { companyRepository } from "./company.repository";
import type { CreateCompany, UpdateCompany } from "./company.dto";
import { companyMembershipService } from "../company-membership/company-membership.service";

const notFound = (): never => {
  throw { statusCode: 404, message: "Company not found" };
};

export const companyService = {
  createCompany: async (data: CreateCompany, userId: string) => {
    const existing = await companyRepository.findBySlug(data.slug);
    if (existing) {
      throw {
        statusCode: 409,
        message: "A company with this slug already exists",
      };
    }

    return companyRepository.create(data).then(async (company) => {
      await companyMembershipService.createInitialMembership(
        userId,
        company.id,
      );
      return company;
    });
  },

  listCompanies: async (includeArchived: boolean) => {
    return companyRepository.findAll(includeArchived);
  },

  getCompany: async (id: string) => {
    const company = await companyRepository.findById(id);
    if (!company) return notFound();
    return company;
  },

  updateCompany: async (id: string, data: UpdateCompany) => {
    const existing = await companyRepository.findById(id);
    if (!existing) return notFound();

    if (data.slug !== undefined) {
      const duplicate = await companyRepository.findBySlug(data.slug);
      if (duplicate && duplicate.id !== id) {
        throw { statusCode: 409, message: "Company slug already exists" };
      }
    }

    const company = await companyRepository.update(id, data);
    if (!company) return notFound();
    return company;
  },

  archiveCompany: async (id: string) => {
    const company = await companyRepository.findById(id);
    if (!company) return notFound();
    if (company.status === "ARCHIVED") {
      throw { statusCode: 409, message: "Company is already archived" };
    }

    const archived = await companyRepository.archive(id);
    if (!archived) return notFound();
    return archived;
  },
};
