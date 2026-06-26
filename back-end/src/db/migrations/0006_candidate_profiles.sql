CREATE TYPE "public"."candidate_profile_seniority" AS ENUM('JUNIOR', 'MID_LEVEL', 'SENIOR', 'STAFF');--> statement-breakpoint
CREATE TYPE "public"."candidate_profile_availability_status" AS ENUM('OPEN_TO_WORK', 'NOT_LOOKING');--> statement-breakpoint
CREATE TYPE "public"."candidate_profile_status" AS ENUM('ACTIVE', 'DEACTIVATED');--> statement-breakpoint
CREATE TABLE "candidate_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "full_name" varchar(120) NOT NULL,
  "headline" varchar(255),
  "summary" text,
  "location" varchar(120),
  "photo_url" text,
  "seniority" "candidate_profile_seniority",
  "availability_status" "candidate_profile_availability_status" DEFAULT 'OPEN_TO_WORK' NOT NULL,
  "status" "candidate_profile_status" DEFAULT 'ACTIVE' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD CONSTRAINT "candidate_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "candidate_profiles_user_id_idx" ON "candidate_profiles" USING btree ("user_id");--> statement-breakpoint
