import {
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { candidateProfilesTable } from "../candidate-profile/candidate-profile.schema.js";
import { positionsTable } from "../position/position.schema.js";
import { usersTable } from "../user/user.schema.js";

export const candidatePositionStatusEnum = pgEnum("candidate_position_status", [
  "SHORTLISTED",
  "DISCARDED",
  "UNDER_REVIEW",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
]);

export type CandidatePositionStatus =
  (typeof candidatePositionStatusEnum.enumValues)[number];

export const candidatePositionsTable = pgTable(
  "candidate_positions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    positionId: uuid("position_id")
      .notNull()
      .references(() => positionsTable.id),
    candidateProfileId: uuid("candidate_profile_id")
      .notNull()
      .references(() => candidateProfilesTable.id),
    status: candidatePositionStatusEnum("status").notNull(),
    decidedByUserId: uuid("decided_by_user_id").references(() => usersTable.id),
    decidedAt: timestamp("decided_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("candidate_positions_position_candidate_idx").on(
      table.positionId,
      table.candidateProfileId,
    ),
  ],
);

export const candidatePositionHistoriesTable = pgTable(
  "candidate_position_histories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    candidatePositionId: uuid("candidate_position_id")
      .notNull()
      .references(() => candidatePositionsTable.id),
    fromStatus: candidatePositionStatusEnum("from_status"),
    toStatus: candidatePositionStatusEnum("to_status").notNull(),
    changedByUserId: uuid("changed_by_user_id")
      .notNull()
      .references(() => usersTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
);
