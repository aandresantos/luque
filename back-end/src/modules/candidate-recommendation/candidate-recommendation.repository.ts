import {
  and,
  asc,
  eq,
  inArray,
  isNull,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { db, type DbClient, type DbTransaction } from "../../db/index";
import { teamsTable } from "../team/team.schema";
import {
  candidateRecommendationHistoriesTable,
  candidateRecommendationsTable,
  type CandidateRecommendationStatus,
} from "./candidate-recommendation.schema";
import { candidateProfilesTable } from "../candidate-profile/candidate-profile.schema";
import { companyMembershipsTable } from "../company-membership/company-membership.schema";
import { positionsTable } from "../position/position.schema";
import {
  candidatePositionHistoriesTable,
  candidatePositionsTable,
} from "../candidate-position/candidate-position.schema";

type DbExecutor = DbClient | DbTransaction;

const getExecutor = (tx?: DbTransaction): DbExecutor => tx ?? db;

export type CandidateRecommendationRow =
  typeof candidateRecommendationsTable.$inferSelect;
export type CandidateRecommendationHistoryRow =
  typeof candidateRecommendationHistoriesTable.$inferSelect;
export type CandidatePositionRow = typeof candidatePositionsTable.$inferSelect;
export type CandidateProfileRow = typeof candidateProfilesTable.$inferSelect;
export type MembershipRow = typeof companyMembershipsTable.$inferSelect;
export type PositionRow = typeof positionsTable.$inferSelect;

export type PositionAccessContext = {
  id: string;
  status: PositionRow["status"];
  companyId: string;
  title: string;
};

type CreateCandidateRecommendationRecord = {
  positionId: string;
  candidateProfileId: string;
  source: CandidateRecommendationRow["source"];
  score?: number;
  matchingVersion?: string;
  reason?: string;
};

type UpdateDecisionInput = {
  id: string;
  fromStatus: CandidateRecommendationStatus;
  toStatus: Exclude<CandidateRecommendationStatus, "PENDING"> | "PENDING";
  decidedAt: Date | null;
  decidedByMembershipId: string | null;
};

type UpdateMatchingDataInput = {
  id: string;
  score: number;
  matchingVersion: string;
  reason?: string;
  generatedAt: Date;
};

const mapCursorFilter = (
  cursorRow: CandidateRecommendationRow,
): SQL<unknown> => {
  if (cursorRow.score === null) {
    return and(
      isNull(candidateRecommendationsTable.score),
      or(
        sql`${candidateRecommendationsTable.createdAt} > ${cursorRow.createdAt}`,
        and(
          eq(candidateRecommendationsTable.createdAt, cursorRow.createdAt),
          sql`${candidateRecommendationsTable.id} > ${cursorRow.id}`,
        ),
      ),
    )!;
  }

  return or(
    isNull(candidateRecommendationsTable.score),
    sql`${candidateRecommendationsTable.score} < ${cursorRow.score}`,
    and(
      eq(candidateRecommendationsTable.score, cursorRow.score),
      or(
        sql`${candidateRecommendationsTable.createdAt} > ${cursorRow.createdAt}`,
        and(
          eq(candidateRecommendationsTable.createdAt, cursorRow.createdAt),
          sql`${candidateRecommendationsTable.id} > ${cursorRow.id}`,
        ),
      ),
    ),
  )!;
};

export const candidateRecommendationRepository = {
  withTransaction: async <T>(
    callback: (tx: DbTransaction) => Promise<T>,
  ): Promise<T> => db.transaction(callback),

  findById: async (
    id: string,
    tx?: DbTransaction,
  ): Promise<CandidateRecommendationRow | undefined> => {
    const executor = getExecutor(tx);
    const rows = await executor
      .select()
      .from(candidateRecommendationsTable)
      .where(eq(candidateRecommendationsTable.id, id));
    return rows[0];
  },

  lockById: async (
    id: string,
    tx: DbTransaction,
  ): Promise<CandidateRecommendationRow | undefined> => {
    await tx.execute(sql`
      select id
      from candidate_recommendations
      where id = ${id}
      for update
    `);

    const rows = await tx
      .select()
      .from(candidateRecommendationsTable)
      .where(eq(candidateRecommendationsTable.id, id));

    return rows[0];
  },

  findByPositionAndCandidate: async (
    positionId: string,
    candidateProfileId: string,
    tx?: DbTransaction,
  ): Promise<CandidateRecommendationRow | undefined> => {
    const executor = getExecutor(tx);
    const rows = await executor
      .select()
      .from(candidateRecommendationsTable)
      .where(
        and(
          eq(candidateRecommendationsTable.positionId, positionId),
          eq(
            candidateRecommendationsTable.candidateProfileId,
            candidateProfileId,
          ),
        ),
      );
    return rows[0];
  },

  findByPositionAndCandidateIds: async (
    positionId: string,
    candidateProfileIds: string[],
    tx?: DbTransaction,
  ): Promise<CandidateRecommendationRow[]> => {
    if (candidateProfileIds.length === 0) {
      return [];
    }

    const executor = getExecutor(tx);
    return executor
      .select()
      .from(candidateRecommendationsTable)
      .where(
        and(
          eq(candidateRecommendationsTable.positionId, positionId),
          inArray(
            candidateRecommendationsTable.candidateProfileId,
            candidateProfileIds,
          ),
        ),
      );
  },

  listByPosition: async (
    input: {
      positionId: string;
      status?: CandidateRecommendationStatus;
      limit: number;
      cursor?: string;
    },
    tx?: DbTransaction,
  ): Promise<{ items: CandidateRecommendationRow[]; nextCursor: string | null }> => {
    const executor = getExecutor(tx);
    const conditions: SQL<unknown>[] = [
      eq(candidateRecommendationsTable.positionId, input.positionId),
    ];

    if (input.status) {
      conditions.push(eq(candidateRecommendationsTable.status, input.status));
    }

    if (input.cursor) {
      const cursorRows = await executor
        .select()
        .from(candidateRecommendationsTable)
        .where(eq(candidateRecommendationsTable.id, input.cursor));
      const cursorRow = cursorRows[0];
      if (cursorRow && cursorRow.positionId === input.positionId) {
        conditions.push(mapCursorFilter(cursorRow));
      }
    }

    const rows = await executor
      .select()
      .from(candidateRecommendationsTable)
      .where(and(...conditions))
      .orderBy(
        sql`${candidateRecommendationsTable.score} desc nulls last`,
        asc(candidateRecommendationsTable.createdAt),
        asc(candidateRecommendationsTable.id),
      )
      .limit(input.limit + 1);

    const hasNextPage = rows.length > input.limit;
    const items = hasNextPage ? rows.slice(0, input.limit) : rows;

    return {
      items,
      nextCursor: hasNextPage ? items[items.length - 1]?.id ?? null : null,
    };
  },

  create: async (
    input: CreateCandidateRecommendationRecord,
    tx?: DbTransaction,
  ): Promise<CandidateRecommendationRow> => {
    const executor = getExecutor(tx);
    const rows = await executor
      .insert(candidateRecommendationsTable)
      .values({
        positionId: input.positionId,
        candidateProfileId: input.candidateProfileId,
        source: input.source,
        score: input.score ?? null,
        matchingVersion: input.matchingVersion ?? null,
        reason: input.reason ?? null,
      })
      .returning();

    const created = rows[0];

    await executor.insert(candidateRecommendationHistoriesTable).values({
      recommendationId: created.id,
      fromStatus: null,
      toStatus: "PENDING",
      changedByMembershipId: null,
    });

    return created;
  },

  createMany: async (
    inputs: CreateCandidateRecommendationRecord[],
    tx?: DbTransaction,
  ): Promise<CandidateRecommendationRow[]> => {
    if (inputs.length === 0) {
      return [];
    }

    const executor = getExecutor(tx);
    const rows = await executor
      .insert(candidateRecommendationsTable)
      .values(
        inputs.map((input) => ({
          positionId: input.positionId,
          candidateProfileId: input.candidateProfileId,
          source: input.source,
          score: input.score ?? null,
          matchingVersion: input.matchingVersion ?? null,
          reason: input.reason ?? null,
        })),
      )
      .returning();

    await executor.insert(candidateRecommendationHistoriesTable).values(
      rows.map((row) => ({
        recommendationId: row.id,
        fromStatus: null,
        toStatus: "PENDING" as const,
        changedByMembershipId: null,
      })),
    );

    return rows;
  },

  updateDecision: async (
    input: UpdateDecisionInput,
    tx: DbTransaction,
  ): Promise<CandidateRecommendationRow | undefined> => {
    const rows = await tx
      .update(candidateRecommendationsTable)
      .set({
        status: input.toStatus,
        decidedAt: input.decidedAt,
        decidedByMembershipId: input.decidedByMembershipId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(candidateRecommendationsTable.id, input.id),
          eq(candidateRecommendationsTable.status, input.fromStatus),
        ),
      )
      .returning();

    const updated = rows[0];
    if (!updated) {
      return undefined;
    }

    await tx.insert(candidateRecommendationHistoriesTable).values({
      recommendationId: input.id,
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      changedByMembershipId: input.decidedByMembershipId,
    });

    return updated;
  },

  updateMatchingData: async (
    input: UpdateMatchingDataInput,
    tx?: DbTransaction,
  ): Promise<CandidateRecommendationRow | undefined> => {
    const executor = getExecutor(tx);
    const rows = await executor
      .update(candidateRecommendationsTable)
      .set({
        score: input.score,
        matchingVersion: input.matchingVersion,
        reason: input.reason ?? null,
        generatedAt: input.generatedAt,
        updatedAt: new Date(),
      })
      .where(eq(candidateRecommendationsTable.id, input.id))
      .returning();
    return rows[0];
  },

  findPositionAccessContextById: async (
    positionId: string,
    tx?: DbTransaction,
  ): Promise<PositionAccessContext | undefined> => {
    const executor = getExecutor(tx);
    const rows = await executor
      .select({
        id: positionsTable.id,
        status: positionsTable.status,
        companyId: teamsTable.companyId,
        title: positionsTable.title,
      })
      .from(positionsTable)
      .innerJoin(teamsTable, eq(teamsTable.id, positionsTable.teamId))
      .where(eq(positionsTable.id, positionId));
    return rows[0];
  },

  findMembershipForCompanyUser: async (
    companyId: string,
    userId: string,
    tx?: DbTransaction,
  ): Promise<MembershipRow | undefined> => {
    const executor = getExecutor(tx);
    const rows = await executor
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

  findCandidateProfileById: async (
    candidateProfileId: string,
    tx?: DbTransaction,
  ): Promise<CandidateProfileRow | undefined> => {
    const executor = getExecutor(tx);
    const rows = await executor
      .select()
      .from(candidateProfilesTable)
      .where(eq(candidateProfilesTable.id, candidateProfileId));
    return rows[0];
  },

  findCandidateProfilesByIds: async (
    candidateProfileIds: string[],
    tx?: DbTransaction,
  ): Promise<CandidateProfileRow[]> => {
    if (candidateProfileIds.length === 0) {
      return [];
    }

    const executor = getExecutor(tx);
    return executor
      .select()
      .from(candidateProfilesTable)
      .where(inArray(candidateProfilesTable.id, candidateProfileIds));
  },

  findCandidatePositionByPositionAndCandidate: async (
    positionId: string,
    candidateProfileId: string,
    tx?: DbTransaction,
  ): Promise<CandidatePositionRow | undefined> => {
    const executor = getExecutor(tx);
    const rows = await executor
      .select()
      .from(candidatePositionsTable)
      .where(
        and(
          eq(candidatePositionsTable.positionId, positionId),
          eq(candidatePositionsTable.candidateProfileId, candidateProfileId),
        ),
      );
    return rows[0];
  },

  findCandidatePositionsByPositionAndCandidateIds: async (
    positionId: string,
    candidateProfileIds: string[],
    tx?: DbTransaction,
  ): Promise<CandidatePositionRow[]> => {
    if (candidateProfileIds.length === 0) {
      return [];
    }

    const executor = getExecutor(tx);
    return executor
      .select()
      .from(candidatePositionsTable)
      .where(
        and(
          eq(candidatePositionsTable.positionId, positionId),
          inArray(candidatePositionsTable.candidateProfileId, candidateProfileIds),
        ),
      );
  },

  createCandidatePositionFromRecommendation: async (
    input: {
      positionId: string;
      candidateProfileId: string;
      userId: string;
    },
    tx: DbTransaction,
  ): Promise<CandidatePositionRow> => {
    const now = new Date();
    const candidatePositionRows = await tx
      .insert(candidatePositionsTable)
      .values({
        positionId: input.positionId,
        candidateProfileId: input.candidateProfileId,
        status: "SHORTLISTED",
        decidedByUserId: input.userId,
        decidedAt: now,
      })
      .returning();

    const created = candidatePositionRows[0];

    await tx.insert(candidatePositionHistoriesTable).values({
      candidatePositionId: created.id,
      fromStatus: null,
      toStatus: "SHORTLISTED",
      changedByUserId: input.userId,
      createdAt: now,
    });

    return created;
  },
};
