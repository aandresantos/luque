import { and, eq, isNull } from "drizzle-orm";
import type { DbClient, DbTransaction } from "../../db";
import { db } from "../../db";
import { authCredentialsTable, authSessionsTable } from "./auth.schema";

type DbExecutor = DbClient | DbTransaction;

export type AuthCredentialRow = typeof authCredentialsTable.$inferSelect;
export type AuthSessionRow = typeof authSessionsTable.$inferSelect;

export const authRepository = {
  findCredentialByUserId: async (
    userId: string,
    executor: DbExecutor = db,
  ): Promise<AuthCredentialRow | undefined> => {
    const rows = await executor
      .select()
      .from(authCredentialsTable)
      .where(eq(authCredentialsTable.userId, userId));

    return rows[0];
  },

  createCredential: async (
    data: { userId: string; passwordHash: string },
    executor: DbExecutor = db,
  ): Promise<AuthCredentialRow> => {
    const rows = await executor
      .insert(authCredentialsTable)
      .values({
        userId: data.userId,
        passwordHash: data.passwordHash,
      })
      .returning();

    return rows[0];
  },

  createSession: async (
    data: { userId: string; refreshTokenHash: string; expiresAt: Date },
    executor: DbExecutor = db,
  ): Promise<AuthSessionRow> => {
    const rows = await executor
      .insert(authSessionsTable)
      .values(data)
      .returning();

    return rows[0];
  },

  findSessionByRefreshTokenHash: async (
    refreshTokenHash: string,
    executor: DbExecutor = db,
  ): Promise<AuthSessionRow | undefined> => {
    const rows = await executor
      .select()
      .from(authSessionsTable)
      .where(eq(authSessionsTable.refreshTokenHash, refreshTokenHash));

    return rows[0];
  },

  findActiveSessionById: async (
    sessionId: string,
    executor: DbExecutor = db,
  ): Promise<AuthSessionRow | undefined> => {
    const rows = await executor
      .select()
      .from(authSessionsTable)
      .where(
        and(eq(authSessionsTable.id, sessionId), isNull(authSessionsTable.revokedAt)),
      );

    return rows[0];
  },

  rotateSession: async (
    sessionId: string,
    data: { refreshTokenHash: string; expiresAt: Date },
    executor: DbExecutor = db,
  ): Promise<AuthSessionRow | undefined> => {
    const rows = await executor
      .update(authSessionsTable)
      .set({
        refreshTokenHash: data.refreshTokenHash,
        expiresAt: data.expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(authSessionsTable.id, sessionId))
      .returning();

    return rows[0];
  },

  revokeSession: async (
    sessionId: string,
    executor: DbExecutor = db,
  ): Promise<AuthSessionRow | undefined> => {
    const rows = await executor
      .update(authSessionsTable)
      .set({
        revokedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(eq(authSessionsTable.id, sessionId), isNull(authSessionsTable.revokedAt)),
      )
      .returning();

    return rows[0];
  },

  revokeSessionsByUserId: async (
    userId: string,
    executor: DbExecutor = db,
  ): Promise<void> => {
    await executor
      .update(authSessionsTable)
      .set({
        revokedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(eq(authSessionsTable.userId, userId), isNull(authSessionsTable.revokedAt)),
      );
  },
};
