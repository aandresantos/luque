import {
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  text,
} from "drizzle-orm/pg-core";
import { usersTable } from "../user/user.schema";

export const candidateProfileSeniorityEnum = pgEnum(
  "candidate_profile_seniority",
  ["JUNIOR", "MID_LEVEL", "SENIOR", "STAFF"],
);
export const candidateProfileAvailabilityStatusEnum = pgEnum(
  "candidate_profile_availability_status",
  ["OPEN_TO_WORK", "NOT_LOOKING"],
);
export const candidateProfileStatusEnum = pgEnum("candidate_profile_status", [
  "ACTIVE",
  "DEACTIVATED",
]);

export type CandidateProfileSeniority =
  (typeof candidateProfileSeniorityEnum.enumValues)[number];

export type CandidateProfileAvailabilityStatus =
  (typeof candidateProfileAvailabilityStatusEnum.enumValues)[number];

export type CandidateProfileStatus =
  (typeof candidateProfileStatusEnum.enumValues)[number];

export const candidateProfilesTable = pgTable(
  "candidate_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id),
    fullName: varchar("full_name", { length: 120 }).notNull(),
    headline: varchar("headline", { length: 255 }),
    summary: text("summary"),
    location: varchar("location", { length: 120 }),
    photoUrl: text("photo_url"),
    seniority: candidateProfileSeniorityEnum("seniority"),
    availabilityStatus: candidateProfileAvailabilityStatusEnum(
      "availability_status",
    )
      .notNull()
      .default("OPEN_TO_WORK"),
    status: candidateProfileStatusEnum("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("candidate_profiles_user_id_idx").on(table.userId)],
);
