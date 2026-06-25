CREATE TYPE "public"."user_type" AS ENUM('CANDIDATE', 'COMPANY_USER');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "type" "user_type" DEFAULT 'CANDIDATE';--> statement-breakpoint
UPDATE "users" SET "type" = 'CANDIDATE' WHERE "type" IS NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "type" DROP DEFAULT;