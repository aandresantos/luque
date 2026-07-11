import {
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "../user/user.schema";

export const authProviderEnum = pgEnum("auth_provider", ["PASSWORD"]);

export type AuthProvider = (typeof authProviderEnum.enumValues)[number];

export const authCredentialsTable = pgTable(
  "auth_credentials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id),
    provider: authProviderEnum("provider").notNull().default("PASSWORD"),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("auth_credentials_user_provider_idx").on(table.userId, table.provider)],
);

export const authSessionsTable = pgTable(
  "auth_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id),
    refreshTokenHash: varchar("refresh_token_hash", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("auth_sessions_refresh_token_hash_idx").on(table.refreshTokenHash),
  ],
);
