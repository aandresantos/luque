import { and, eq } from "drizzle-orm";
import type { DbClient, DbTransaction } from "../../db";
import { db } from "../../db/index";
import { usersTable } from "./user.schema";
import type { CreateUser } from "./user.dto";

type DbExecutor = DbClient | DbTransaction;

export type UserRow = typeof usersTable.$inferSelect;

export const userRepository = {
  findById: async (
    id: string,
    executor: DbExecutor = db,
  ): Promise<UserRow | undefined> => {
    const rows = await executor
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));
    return rows[0];
  },

  findByEmail: async (
    email: string,
    executor: DbExecutor = db,
  ): Promise<UserRow | undefined> => {
    const rows = await executor
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    return rows[0];
  },

  create: async (
    data: CreateUser,
    executor: DbExecutor = db,
  ): Promise<UserRow> => {
    const rows = await executor
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
    executor: DbExecutor = db,
  ): Promise<UserRow | undefined> => {
    const rows = await executor
      .update(usersTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(usersTable.id, id))
      .returning();
    return rows[0];
  },

  deactivate: async (
    id: string,
    executor: DbExecutor = db,
  ): Promise<UserRow | undefined> => {
    const rows = await executor
      .update(usersTable)
      .set({ status: "DEACTIVATED", updatedAt: new Date() })
      .where(and(eq(usersTable.id, id), eq(usersTable.status, "ACTIVE")))
      .returning();
    return rows[0];
  },
};
