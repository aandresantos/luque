import type {
  CreateCompanyMembership,
  UpdateCompanyMembershipRole,
} from "./company-membership.dto.js";
import { companyMembershipRepository } from "./company-membership.repository.js";

const notFound = (): never => {
  throw { statusCode: 404, message: "Company membership not found" };
};

const forbidden = (): never => {
  throw { statusCode: 403, message: "Only company admins can manage memberships" };
};

export const companyMembershipService = {
  createMembership: async (
    actorUserId: string,
    companyId: string,
    data: CreateCompanyMembership,
  ) => {
    const company = await companyMembershipRepository.findCompanyById(companyId);
    if (!company) {
      throw { statusCode: 404, message: "Company not found" };
    }

    const isAdmin = await companyMembershipRepository.isActiveAdminForCompany(
      companyId,
      actorUserId,
    );
    if (!isAdmin) {
      return forbidden();
    }

    const user = await companyMembershipRepository.findUserById(data.userId);
    if (!user) {
      throw { statusCode: 404, message: "User not found" };
    }

    if (user.type !== "COMPANY_USER") {
      throw {
        statusCode: 409,
        message: "Only users with type COMPANY_USER can have company memberships",
      };
    }

    const activeMembership =
      await companyMembershipRepository.findActiveByCompanyIdAndUserId(
        companyId,
        data.userId,
      );

    if (activeMembership) {
      throw {
        statusCode: 409,
        message: "User already has an active membership for this company",
      };
    }

    return companyMembershipRepository.create(companyId, data);
  },

  listMembershipsByCompany: async (
    companyId: string,
    includeInactive: boolean,
  ) => {
    const company = await companyMembershipRepository.findCompanyById(companyId);
    if (!company) {
      throw { statusCode: 404, message: "Company not found" };
    }

    return companyMembershipRepository.findAllByCompanyId(
      companyId,
      includeInactive,
    );
  },

  listMembershipsByUser: async (userId: string, includeInactive: boolean) => {
    const user = await companyMembershipRepository.findUserById(userId);
    if (!user) {
      throw { statusCode: 404, message: "User not found" };
    }

    return companyMembershipRepository.findAllByUserId(userId, includeInactive);
  },

  getMembership: async (id: string) => {
    const membership = await companyMembershipRepository.findById(id);
    if (!membership) {
      return notFound();
    }

    return membership;
  },

  updateMembershipRole: async (
    actorUserId: string,
    id: string,
    data: UpdateCompanyMembershipRole,
  ) => {
    const membership = await companyMembershipRepository.findById(id);
    if (!membership) {
      return notFound();
    }

    const isAdmin = await companyMembershipRepository.isActiveAdminForCompany(
      membership.companyId,
      actorUserId,
    );
    if (!isAdmin) {
      return forbidden();
    }

    if (membership.role === "ADMIN" && membership.status === "ACTIVE") {
      const activeAdmins =
        await companyMembershipRepository.countActiveAdminsByCompanyId(
          membership.companyId,
        );

      if (activeAdmins === 1 && data.role !== "ADMIN") {
        throw {
          statusCode: 409,
          message:
            "The last active ADMIN cannot have its role changed until another active ADMIN exists",
        };
      }
    }

    const updated = await companyMembershipRepository.updateRole(id, data.role);
    if (!updated) {
      return notFound();
    }

    return updated;
  },

  deactivateMembership: async (actorUserId: string, id: string) => {
    const membership = await companyMembershipRepository.findById(id);
    if (!membership) {
      return notFound();
    }

    const isAdmin = await companyMembershipRepository.isActiveAdminForCompany(
      membership.companyId,
      actorUserId,
    );
    if (!isAdmin) {
      return forbidden();
    }

    if (membership.status === "INACTIVE") {
      throw {
        statusCode: 409,
        message: "Company membership is already inactive",
      };
    }

    if (membership.role === "ADMIN") {
      const activeAdmins =
        await companyMembershipRepository.countActiveAdminsByCompanyId(
          membership.companyId,
        );

      if (membership.status === "ACTIVE" && activeAdmins === 1) {
        throw {
          statusCode: 409,
          message: "The last active ADMIN cannot be deactivated",
        };
      }
    }

    const updated = await companyMembershipRepository.deactivate(id);
    if (!updated) {
      return notFound();
    }

    return updated;
  },
};
