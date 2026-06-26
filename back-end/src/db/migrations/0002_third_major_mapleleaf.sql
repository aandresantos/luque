CREATE TYPE "public"."company_status" AS ENUM('ACTIVE', 'ARCHIVED');--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "slug" varchar(120);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "status" "company_status" DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
WITH company_slug_bases AS (
  SELECT
    id,
    CASE
      WHEN regexp_replace(lower(trim(name)), '[^a-z0-9]+', '-', 'g') = ''
        THEN 'company-' || substr(id::text, 1, 8)
      ELSE left(trim(both '-' from regexp_replace(lower(trim(name)), '[^a-z0-9]+', '-', 'g')), 110)
    END AS base_slug
  FROM "companies"
  WHERE "slug" IS NULL
), company_slug_ranked AS (
  SELECT
    id,
    base_slug,
    row_number() OVER (PARTITION BY base_slug ORDER BY id) AS slug_rank
  FROM company_slug_bases
)
UPDATE "companies" AS companies
SET "slug" = CASE
  WHEN company_slug_ranked.slug_rank = 1 THEN company_slug_ranked.base_slug
  ELSE left(company_slug_ranked.base_slug, 110) || '-' || company_slug_ranked.slug_rank
END
FROM company_slug_ranked
WHERE companies.id = company_slug_ranked.id;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "companies_slug_idx" ON "companies" USING btree ("slug");
