import { eq, and } from "drizzle-orm";
import { db } from "../../db/index";
import { positionsTable, PositionStatus } from "./position.schema";
import type { CreatePosition } from "./position.dto";

export type PositionRow = typeof positionsTable.$inferSelect;

export const positionRepository = {
  findById: async (id: string): Promise<PositionRow | undefined> => {
    const rows = await db
      .select()
      .from(positionsTable)
      .where(eq(positionsTable.id, id));
    return rows[0];
  },

  findAllByTeamId: async (
    teamId: string,
    includesClosed: boolean,
  ): Promise<PositionRow[]> => {
    if (includesClosed) {
      return db
        .select()
        .from(positionsTable)
        .where(eq(positionsTable.teamId, teamId));
    }

    return db
      .select()
      .from(positionsTable)
      .where(
        and(
          eq(positionsTable.teamId, teamId),
          eq(positionsTable.status, "OPEN"),
        ),
      );
  },

  create: async (
    teamId: string,
    data: CreatePosition,
  ): Promise<PositionRow> => {
    const rows = await db
      .insert(positionsTable)
      .values({
        teamId,
        title: data.title,
        description: data.description ?? null,
      })
      .returning();
    return rows[0];
  },

  update: async (
    id: string,
    data: Partial<Pick<PositionRow, "title" | "description">>,
  ): Promise<PositionRow | undefined> => {
    const rows = await db
      .update(positionsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(positionsTable.id, id))
      .returning();
    return rows[0];
  },

  updateStatus: async (
    id: string,
    status: PositionStatus,
  ): Promise<PositionRow | undefined> => {
    const rows = await db
      .update(positionsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(positionsTable.id, id))
      .returning();
    return rows[0];
  },
};
