import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const companyStatusEnum = pgEnum("company_status", ["ACTIVE", "ARCHIVED"]);

export type CompanyStatus = (typeof companyStatusEnum.enumValues)[number];

export const companiesTable = pgTable(
  "companies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    description: text("description"),
    logoUrl: text("logo_url"),
    status: companyStatusEnum("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("companies_slug_idx").on(table.slug)],
);
