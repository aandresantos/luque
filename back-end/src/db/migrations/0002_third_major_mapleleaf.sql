CREATE TYPE "public"."company_status" AS ENUM('ACTIVE', 'ARCHIVED');--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "slug" varchar(120) NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "status" "company_status" DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "companies_slug_idx" ON "companies" USING btree ("slug");