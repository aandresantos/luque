import { and, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { usersTable } from "./user.schema.js";
import type { CreateUser } from "./user.dto.js";

export type UserRow = typeof usersTable.$inferSelect;

export const userRepository = {
  findById: async (id: string): Promise<UserRow | undefined> => {
    const rows = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return rows[0];
  },

  findByEmail: async (email: string): Promise<UserRow | undefined> => {
    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    return rows[0];
  },

  create: async (data: CreateUser): Promise<UserRow> => {
    const rows = await db
      .insert(usersTable)
      .values({
        name: data.name,
        email: data.email,
        type: data.type,
      })
      .returning();
    return rows[0];
  },

  update: async (
    id: string,
    data: Partial<Pick<UserRow, "name" | "email">>,
  ): Promise<UserRow | undefined> => {
    const rows = await db
      .update(usersTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(usersTable.id, id))
      .returning();
    return rows[0];
  },

  deactivate: async (id: string): Promise<UserRow | undefined> => {
    const rows = await db
      .update(usersTable)
      .set({ status: "DEACTIVATED", updatedAt: new Date() })
      .where(and(eq(usersTable.id, id), eq(usersTable.status, "ACTIVE")))
      .returning();
    return rows[0];
  },
};
