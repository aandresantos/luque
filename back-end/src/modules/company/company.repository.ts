import { and, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { companiesTable } from "./company.schema.js";
import type { CreateCompany } from "./company.dto.js";

export type CompanyRow = typeof companiesTable.$inferSelect;

export const companyRepository = {
  findById: async (id: string): Promise<CompanyRow | undefined> => {
    const rows = await db
      .select()
      .from(companiesTable)
      .where(eq(companiesTable.id, id));
    return rows[0];
  },

  findAll: async (includeArchived: boolean): Promise<CompanyRow[]> => {
    if (includeArchived) {
      return db.select().from(companiesTable);
    }

    return db
      .select()
      .from(companiesTable)
      .where(eq(companiesTable.status, "ACTIVE"));
  },

  findBySlug: async (slug: string): Promise<CompanyRow | undefined> => {
    const rows = await db
      .select()
      .from(companiesTable)
      .where(eq(companiesTable.slug, slug));
    return rows[0];
  },

  create: async (data: CreateCompany): Promise<CompanyRow> => {
    const rows = await db
      .insert(companiesTable)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        logoUrl: data.logoUrl ?? null,
      })
      .returning();
    return rows[0];
  },

  update: async (
    id: string,
    data: Partial<
      Pick<CompanyRow, "name" | "slug" | "description" | "logoUrl">
    >,
  ): Promise<CompanyRow | undefined> => {
    const rows = await db
      .update(companiesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(companiesTable.id, id))
      .returning();
    return rows[0];
  },

  archive: async (id: string): Promise<CompanyRow | undefined> => {
    const rows = await db
      .update(companiesTable)
      .set({ status: "ARCHIVED", updatedAt: new Date() })
      .where(and(eq(companiesTable.id, id), eq(companiesTable.status, "ACTIVE")))
      .returning();
    return rows[0];
  },
};
