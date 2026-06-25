import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { usersTable } from "../user/user.schema.js";
import { candidateProfilesTable } from "./candidate-profile.schema.js";
import type {
  CreateCandidateProfile,
  UpdateCurrentCandidateProfile,
} from "./candidate-profile.dto.js";

export type CandidateProfileRow = typeof candidateProfilesTable.$inferSelect;
export type CandidateProfileUserRow = typeof usersTable.$inferSelect;

export const candidateProfileRepository = {
  findById: async (id: string): Promise<CandidateProfileRow | undefined> => {
    const rows = await db
      .select()
      .from(candidateProfilesTable)
      .where(eq(candidateProfilesTable.id, id));
    return rows[0];
  },

  findByUserId: async (
    userId: string,
  ): Promise<CandidateProfileRow | undefined> => {
    const rows = await db
      .select()
      .from(candidateProfilesTable)
      .where(eq(candidateProfilesTable.userId, userId));
    return rows[0];
  },

  findActive: async (): Promise<CandidateProfileRow[]> => {
    return db
      .select()
      .from(candidateProfilesTable)
      .where(eq(candidateProfilesTable.status, "ACTIVE"));
  },

  findUserById: async (
    userId: string,
  ): Promise<CandidateProfileUserRow | undefined> => {
    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    return rows[0];
  },

  create: async (
    userId: string,
    data: CreateCandidateProfile,
  ): Promise<CandidateProfileRow> => {
    const rows = await db
      .insert(candidateProfilesTable)
      .values({
        userId,
        fullName: data.fullName,
        headline: data.headline ?? null,
        summary: data.summary ?? null,
        location: data.location ?? null,
        photoUrl: data.photoUrl ?? null,
        seniority: data.seniority ?? null,
        availabilityStatus: data.availabilityStatus ?? "OPEN_TO_WORK",
      })
      .returning();
    return rows[0];
  },

  updateByUserId: async (
    userId: string,
    data: UpdateCurrentCandidateProfile,
  ): Promise<CandidateProfileRow | undefined> => {
    const rows = await db
      .update(candidateProfilesTable)
      .set({
        fullName: data.fullName,
        headline: data.headline,
        summary: data.summary,
        location: data.location,
        photoUrl: data.photoUrl,
        seniority: data.seniority,
        availabilityStatus: data.availabilityStatus,
        updatedAt: new Date(),
      })
      .where(eq(candidateProfilesTable.userId, userId))
      .returning();
    return rows[0];
  },

  deactivateByUserId: async (
    userId: string,
  ): Promise<CandidateProfileRow | undefined> => {
    const rows = await db
      .update(candidateProfilesTable)
      .set({ status: "DEACTIVATED", updatedAt: new Date() })
      .where(eq(candidateProfilesTable.userId, userId))
      .returning();
    return rows[0];
  },
};
