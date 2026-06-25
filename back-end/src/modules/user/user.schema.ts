import {
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userStatusEnum = pgEnum("user_status", ["ACTIVE", "DEACTIVATED"]);
export const userTypeEnum = pgEnum("user_type", ["CANDIDATE", "COMPANY_USER"]);

export type UserStatus = (typeof userStatusEnum.enumValues)[number];
export type UserType = (typeof userTypeEnum.enumValues)[number];

export const usersTable = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    type: userTypeEnum("type").notNull(),
    status: userStatusEnum("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)],
);
