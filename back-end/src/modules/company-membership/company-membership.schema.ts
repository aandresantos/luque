import {
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { companiesTable } from "../company/company.schema";
import { usersTable } from "../user/user.schema";

export const companyMembershipRoleEnum = pgEnum("company_membership_role", [
  "ADMIN",
  "RECRUITER",
  "RECRUITER_MANAGER",
]);

export const companyMembershipStatusEnum = pgEnum(
  "company_membership_status",
  ["ACTIVE", "INACTIVE"],
);

export type CompanyMembershipRole =
  (typeof companyMembershipRoleEnum.enumValues)[number];
export type CompanyMembershipStatus =
  (typeof companyMembershipStatusEnum.enumValues)[number];

export const companyMembershipsTable = pgTable(
  "company_memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companiesTable.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id),
    role: companyMembershipRoleEnum("role").notNull(),
    status: companyMembershipStatusEnum("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("company_memberships_active_company_user_idx")
      .on(table.companyId, table.userId)
      .where(sql`${table.status} = 'ACTIVE'`),
  ],
);
