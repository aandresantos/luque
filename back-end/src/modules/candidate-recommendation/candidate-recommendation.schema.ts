import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { candidatePositionsTable } from "../candidate-position/candidate-position.schema";
import { candidateProfilesTable } from "../candidate-profile/candidate-profile.schema";
import { companyMembershipsTable } from "../company-membership/company-membership.schema";
import { positionsTable } from "../position/position.schema";

export const candidateRecommendationStatusEnum = pgEnum(
  "candidate_recommendation_status",
  ["PENDING", "ACCEPTED", "REJECTED", "REVIEW_LATER"],
);

export const candidateRecommendationSourceEnum = pgEnum(
  "candidate_recommendation_source",
  ["MANUAL", "SEED", "MATCHING_JOB"],
);

export type CandidateRecommendationStatus =
  (typeof candidateRecommendationStatusEnum.enumValues)[number];

export type CandidateRecommendationSource =
  (typeof candidateRecommendationSourceEnum.enumValues)[number];

export const candidateRecommendationsTable = pgTable(
  "candidate_recommendations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    positionId: uuid("position_id")
      .notNull()
      .references(() => positionsTable.id, { onDelete: "cascade" }),
    candidateProfileId: uuid("candidate_profile_id")
      .notNull()
      .references(() => candidateProfilesTable.id, { onDelete: "cascade" }),
    status: candidateRecommendationStatusEnum("status")
      .notNull()
      .default("PENDING"),
    source: candidateRecommendationSourceEnum("source")
      .notNull()
      .default("MANUAL"),
    score: integer("score"),
    matchingVersion: varchar("matching_version", { length: 100 }),
    reason: text("reason"),
    generatedAt: timestamp("generated_at").notNull().defaultNow(),
    decidedAt: timestamp("decided_at"),
    decidedByMembershipId: uuid("decided_by_membership_id").references(
      () => companyMembershipsTable.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("candidate_recommendation_position_candidate_unique").on(
      table.positionId,
      table.candidateProfileId,
    ),
    index("candidate_recommendation_position_status_idx").on(
      table.positionId,
      table.status,
    ),
    index("candidate_recommendation_candidate_idx").on(table.candidateProfileId),
    check(
      "candidate_recommendation_score_range_check",
      sql`${table.score} IS NULL OR (${table.score} >= 0 AND ${table.score} <= 100)`,
    ),
  ],
);

export const candidateRecommendationHistoriesTable = pgTable(
  "candidate_recommendation_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recommendationId: uuid("recommendation_id")
      .notNull()
      .references(() => candidateRecommendationsTable.id, {
        onDelete: "cascade",
      }),
    fromStatus: candidateRecommendationStatusEnum("from_status"),
    toStatus: candidateRecommendationStatusEnum("to_status").notNull(),
    changedByMembershipId: uuid("changed_by_membership_id").references(
      () => companyMembershipsTable.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
);

// Re-exported so the repository can keep the relation rules local to this slice.
export { candidatePositionsTable };
