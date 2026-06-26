import { and, asc, eq } from "drizzle-orm";
import { db } from "database";
import { candidateProfilesTable } from "../candidate-profile/candidate-profile.schema";
import { positionsTable } from "../position/position.schema";
import {
  candidatePositionHistoriesTable,
  candidatePositionsTable,
  type CandidatePositionStatus,
} from "./candidate-position.schema";

export type CandidatePositionRow = typeof candidatePositionsTable.$inferSelect;
export type CandidatePositionHistoryRow =
  typeof candidatePositionHistoriesTable.$inferSelect;
export type PositionRow = typeof positionsTable.$inferSelect;
export type CandidateProfileRow = typeof candidateProfilesTable.$inferSelect;

type CreateCandidatePositionInput = {
  positionId: string;
  candidateProfileId: string;
  status: CandidatePositionStatus;
  userId: string;
};

type UpdateCandidatePositionStatusInput = {
  candidatePositionId: string;
  fromStatus: CandidatePositionStatus;
  toStatus: CandidatePositionStatus;
  userId: string;
  updates?: Partial<
    Pick<CandidatePositionRow, "decidedByUserId" | "decidedAt">
  >;
};

export const candidatePositionRepository = {
  findById: async (id: string): Promise<CandidatePositionRow | undefined> => {
    const rows = await db
      .select()
      .from(candidatePositionsTable)
      .where(eq(candidatePositionsTable.id, id));
    return rows[0];
  },

  findByPositionId: async (
    positionId: string,
  ): Promise<CandidatePositionRow[]> =>
    db
      .select()
      .from(candidatePositionsTable)
      .where(eq(candidatePositionsTable.positionId, positionId)),

  findByPositionAndCandidateProfileId: async (
    positionId: string,
    candidateProfileId: string,
  ): Promise<CandidatePositionRow | undefined> => {
    const rows = await db
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

  findHistoryByCandidatePositionId: async (
    candidatePositionId: string,
  ): Promise<CandidatePositionHistoryRow[]> =>
    db
      .select()
      .from(candidatePositionHistoriesTable)
      .where(
        eq(
          candidatePositionHistoriesTable.candidatePositionId,
          candidatePositionId,
        ),
      )
      .orderBy(asc(candidatePositionHistoriesTable.createdAt)),

  findPositionById: async (
    positionId: string,
  ): Promise<PositionRow | undefined> => {
    const rows = await db
      .select()
      .from(positionsTable)
      .where(eq(positionsTable.id, positionId));
    return rows[0];
  },

  findCandidateProfileById: async (
    candidateProfileId: string,
  ): Promise<CandidateProfileRow | undefined> => {
    const rows = await db
      .select()
      .from(candidateProfilesTable)
      .where(eq(candidateProfilesTable.id, candidateProfileId));
    return rows[0];
  },

  createWithHistory: async (
    input: CreateCandidatePositionInput,
  ): Promise<CandidatePositionRow> =>
    db.transaction(async (tx) => {
      const now = new Date();
      const createdRows = await tx
        .insert(candidatePositionsTable)
        .values({
          positionId: input.positionId,
          candidateProfileId: input.candidateProfileId,
          status: input.status,
          decidedByUserId: input.userId,
          decidedAt: now,
        })
        .returning();

      const created = createdRows[0];

      await tx.insert(candidatePositionHistoriesTable).values({
        candidatePositionId: created.id,
        fromStatus: null,
        toStatus: input.status,
        changedByUserId: input.userId,
      });

      return created;
    }),

  updateStatusWithHistory: async (
    input: UpdateCandidatePositionStatusInput,
  ): Promise<CandidatePositionRow | undefined> =>
    db.transaction(async (tx) => {
      const updatedRows = await tx
        .update(candidatePositionsTable)
        .set({
          status: input.toStatus,
          updatedAt: new Date(),
          ...input.updates,
        })
        .where(
          and(
            eq(candidatePositionsTable.id, input.candidatePositionId),
            eq(candidatePositionsTable.status, input.fromStatus),
          ),
        )
        .returning();

      const updated = updatedRows[0];
      if (!updated) {
        return undefined;
      }

      await tx.insert(candidatePositionHistoriesTable).values({
        candidatePositionId: input.candidatePositionId,
        fromStatus: input.fromStatus,
        toStatus: input.toStatus,
        changedByUserId: input.userId,
      });

      return updated;
    }),
};
