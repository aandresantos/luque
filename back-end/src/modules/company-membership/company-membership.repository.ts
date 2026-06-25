import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { companiesTable } from "../company/company.schema.js";
import { usersTable } from "../user/user.schema.js";
import { type CreateCompanyMembership } from "./company-membership.dto.js";
import {
  companyMembershipsTable,
  type CompanyMembershipRole,
} from "./company-membership.schema.js";

export type CompanyMembershipRow = typeof companyMembershipsTable.$inferSelect;

export const companyMembershipRepository = {
  findById: async (id: string): Promise<CompanyMembershipRow | undefined> => {
    const rows = await db
      .select()
      .from(companyMembershipsTable)
      .where(eq(companyMembershipsTable.id, id));
    return rows[0];
  },

  findAllByCompanyId: async (
    companyId: string,
    includeInactive: boolean,
  ): Promise<CompanyMembershipRow[]> => {
    if (includeInactive) {
      return db
        .select()
        .from(companyMembershipsTable)
        .where(eq(companyMembershipsTable.companyId, companyId));
    }

    return db
      .select()
      .from(companyMembershipsTable)
      .where(
        and(
          eq(companyMembershipsTable.companyId, companyId),
          eq(companyMembershipsTable.status, "ACTIVE"),
        ),
      );
  },

  findAllByUserId: async (
    userId: string,
    includeInactive: boolean,
  ): Promise<CompanyMembershipRow[]> => {
    if (includeInactive) {
      return db
        .select()
        .from(companyMembershipsTable)
        .where(eq(companyMembershipsTable.userId, userId));
    }

    return db
      .select()
      .from(companyMembershipsTable)
      .where(
        and(
          eq(companyMembershipsTable.userId, userId),
          eq(companyMembershipsTable.status, "ACTIVE"),
        ),
      );
  },

  findActiveByCompanyIdAndUserId: async (
    companyId: string,
    userId: string,
  ): Promise<CompanyMembershipRow | undefined> => {
    const rows = await db
      .select()
      .from(companyMembershipsTable)
      .where(
        and(
          eq(companyMembershipsTable.companyId, companyId),
          eq(companyMembershipsTable.userId, userId),
          eq(companyMembershipsTable.status, "ACTIVE"),
        ),
      );
    return rows[0];
  },

  countActiveAdminsByCompanyId: async (companyId: string): Promise<number> => {
    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(companyMembershipsTable)
      .where(
        and(
          eq(companyMembershipsTable.companyId, companyId),
          eq(companyMembershipsTable.role, "ADMIN"),
          eq(companyMembershipsTable.status, "ACTIVE"),
        ),
      );

    return rows[0]?.count ?? 0;
  },

  isActiveAdminForCompany: async (
    companyId: string,
    userId: string,
  ): Promise<boolean> => {
    const rows = await db
      .select({ id: companyMembershipsTable.id })
      .from(companyMembershipsTable)
      .where(
        and(
          eq(companyMembershipsTable.companyId, companyId),
          eq(companyMembershipsTable.userId, userId),
          eq(companyMembershipsTable.role, "ADMIN"),
          eq(companyMembershipsTable.status, "ACTIVE"),
        ),
      );

    return rows[0] !== undefined;
  },

  findCompanyById: async (companyId: string) => {
    const rows = await db
      .select({ id: companiesTable.id })
      .from(companiesTable)
      .where(eq(companiesTable.id, companyId));

    return rows[0];
  },

  findUserById: async (userId: string) => {
    const rows = await db
      .select({
        id: usersTable.id,
        type: usersTable.type,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    return rows[0];
  },

  create: async (
    companyId: string,
    data: CreateCompanyMembership,
  ): Promise<CompanyMembershipRow> => {
    const rows = await db
      .insert(companyMembershipsTable)
      .values({
        companyId,
        userId: data.userId,
        role: data.role,
      })
      .returning();

    return rows[0];
  },

  updateRole: async (
    id: string,
    role: CompanyMembershipRole,
  ): Promise<CompanyMembershipRow | undefined> => {
    const rows = await db
      .update(companyMembershipsTable)
      .set({ role, updatedAt: new Date() })
      .where(eq(companyMembershipsTable.id, id))
      .returning();

    return rows[0];
  },

  deactivate: async (id: string): Promise<CompanyMembershipRow | undefined> => {
    const rows = await db
      .update(companyMembershipsTable)
      .set({ status: "INACTIVE", updatedAt: new Date() })
      .where(eq(companyMembershipsTable.id, id))
      .returning();

    return rows[0];
  },
};
