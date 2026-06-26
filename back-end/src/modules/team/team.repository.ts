import { eq, and } from "drizzle-orm";
import { db } from "../../db/index";
import { teamsTable } from "./team.schema";
import type { CreateTeam } from "./team.dto";

export type TeamRow = typeof teamsTable.$inferSelect;

export const teamRepository = {
  findById: async (id: string): Promise<TeamRow | undefined> => {
    const rows = await db
      .select()
      .from(teamsTable)
      .where(eq(teamsTable.id, id));
    return rows[0];
  },

  findAllByCompanyId: async (
    companyId: string,
    includeArchived: boolean,
  ): Promise<TeamRow[]> => {
    if (includeArchived) {
      return db
        .select()
        .from(teamsTable)
        .where(eq(teamsTable.companyId, companyId));
    }

    return db
      .select()
      .from(teamsTable)
      .where(
        and(
          eq(teamsTable.companyId, companyId),
          eq(teamsTable.status, "ACTIVE"),
        ),
      );
  },

  findByCompanyIdAndName: async (
    companyId: string,
    name: string,
  ): Promise<TeamRow | undefined> => {
    const rows = await db
      .select()
      .from(teamsTable)
      .where(
        and(eq(teamsTable.companyId, companyId), eq(teamsTable.name, name)),
      );
    return rows[0];
  },

  create: async (companyId: string, data: CreateTeam): Promise<TeamRow> => {
    const rows = await db
      .insert(teamsTable)
      .values({
        companyId,
        name: data.name,
        description: data.description ?? null,
      })
      .returning();
    return rows[0];
  },

  update: async (
    id: string,
    data: Partial<Pick<TeamRow, "name" | "description">>,
  ): Promise<TeamRow | undefined> => {
    const rows = await db
      .update(teamsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(teamsTable.id, id))
      .returning();
    return rows[0];
  },

  archive: async (id: string): Promise<TeamRow | undefined> => {
    const rows = await db
      .update(teamsTable)
      .set({ status: "ARCHIVED", updatedAt: new Date() })
      .where(eq(teamsTable.id, id))
      .returning();
    return rows[0];
  },
};
