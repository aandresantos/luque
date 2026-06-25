/// <reference types="vitest/globals" />

import { beforeEach, describe, expect, it, vi } from "vitest";
import { companyMembershipRepository } from "./company-membership.repository.js";
import { companyMembershipService } from "./company-membership.service.js";

vi.mock("./company-membership.repository.js");

const makeMembership = (
  overrides: Partial<
    Awaited<ReturnType<typeof companyMembershipRepository.findById>>
  > = {},
) => ({
  id: "membership-1",
  companyId: "00000000-0000-4000-8000-000000000010",
  userId: "00000000-0000-4000-8000-000000000011",
  role: "ADMIN" as const,
  status: "ACTIVE" as const,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});

describe("companyMembershipService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("createMembership", () => {
    it("creates a membership for a valid company user when actor is admin", async () => {
      const input = {
        userId: "00000000-0000-4000-8000-000000000011",
        role: "RECRUITER" as const,
      };
      const created = makeMembership({
        role: "RECRUITER",
        userId: input.userId,
      });

      vi.mocked(companyMembershipRepository.findCompanyById).mockResolvedValue({
        id: "00000000-0000-4000-8000-000000000010",
      });
      vi.mocked(
        companyMembershipRepository.isActiveAdminForCompany,
      ).mockResolvedValue(true);
      vi.mocked(companyMembershipRepository.findUserById).mockResolvedValue({
        id: input.userId,
        type: "COMPANY_USER",
      });
      vi.mocked(
        companyMembershipRepository.findActiveByCompanyIdAndUserId,
      ).mockResolvedValue(undefined);
      vi.mocked(companyMembershipRepository.create).mockResolvedValue(created);

      const result = await companyMembershipService.createMembership(
        "00000000-0000-4000-8000-000000000001",
        "00000000-0000-4000-8000-000000000010",
        input,
      );

      expect(result).toEqual(created);
      expect(companyMembershipRepository.create).toHaveBeenCalledWith(
        "00000000-0000-4000-8000-000000000010",
        input,
      );
    });

    it("throws 409 when user is not COMPANY_USER", async () => {
      vi.mocked(companyMembershipRepository.findCompanyById).mockResolvedValue({
        id: "00000000-0000-4000-8000-000000000010",
      });
      vi.mocked(
        companyMembershipRepository.isActiveAdminForCompany,
      ).mockResolvedValue(true);
      vi.mocked(companyMembershipRepository.findUserById).mockResolvedValue({
        id: "00000000-0000-4000-8000-000000000011",
        type: "CANDIDATE",
      });

      await expect(
        companyMembershipService.createMembership(
          "00000000-0000-4000-8000-000000000001",
          "00000000-0000-4000-8000-000000000010",
          {
            userId: "00000000-0000-4000-8000-000000000011",
            role: "RECRUITER",
          },
        ),
      ).rejects.toMatchObject({
        statusCode: 409,
        message:
          "Only users with type COMPANY_USER can have company memberships",
      });
    });
  });

  describe("updateMembershipRole", () => {
    it("throws 409 when changing the last active ADMIN to a different role", async () => {
      vi.mocked(companyMembershipRepository.findById).mockResolvedValue(
        makeMembership(),
      );
      vi.mocked(
        companyMembershipRepository.isActiveAdminForCompany,
      ).mockResolvedValue(true);
      vi.mocked(
        companyMembershipRepository.countActiveAdminsByCompanyId,
      ).mockResolvedValue(1);

      await expect(
        companyMembershipService.updateMembershipRole(
          "00000000-0000-4000-8000-000000000001",
          "membership-1",
          { role: "RECRUITER" },
        ),
      ).rejects.toMatchObject({
        statusCode: 409,
        message:
          "The last active ADMIN cannot have its role changed until another active ADMIN exists",
      });
    });
  });

  describe("deactivateMembership", () => {
    it("throws 409 when trying to deactivate the last active ADMIN", async () => {
      vi.mocked(companyMembershipRepository.findById).mockResolvedValue(
        makeMembership(),
      );
      vi.mocked(
        companyMembershipRepository.isActiveAdminForCompany,
      ).mockResolvedValue(true);
      vi.mocked(
        companyMembershipRepository.countActiveAdminsByCompanyId,
      ).mockResolvedValue(1);

      await expect(
        companyMembershipService.deactivateMembership(
          "00000000-0000-4000-8000-000000000001",
          "membership-1",
        ),
      ).rejects.toMatchObject({
        statusCode: 409,
        message: "The last active ADMIN cannot be deactivated",
      });
    });

    it("deactivates a non-admin membership", async () => {
      const membership = makeMembership({
        id: "membership-2",
        role: "RECRUITER",
      });
      const inactive = makeMembership({
        id: "membership-2",
        role: "RECRUITER",
        status: "INACTIVE",
      });

      vi.mocked(companyMembershipRepository.findById).mockResolvedValue(
        membership,
      );
      vi.mocked(
        companyMembershipRepository.isActiveAdminForCompany,
      ).mockResolvedValue(true);
      vi.mocked(companyMembershipRepository.deactivate).mockResolvedValue(
        inactive,
      );

      const result = await companyMembershipService.deactivateMembership(
        "00000000-0000-4000-8000-000000000001",
        "membership-2",
      );

      expect(result).toEqual(inactive);
      expect(companyMembershipRepository.deactivate).toHaveBeenCalledWith(
        "membership-2",
      );
    });
  });
});
