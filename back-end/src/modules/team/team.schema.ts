import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { companiesTable } from "../company/company.schema";

export const teamStatusEnum = pgEnum("team_status", ["ACTIVE", "ARCHIVED"]);

export type TeamStatus = (typeof teamStatusEnum.enumValues)[number];

export const teamsTable = pgTable(
  "teams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companiesTable.id),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    status: teamStatusEnum("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("teams_company_id_name_idx").on(table.companyId, table.name),
  ],
);
