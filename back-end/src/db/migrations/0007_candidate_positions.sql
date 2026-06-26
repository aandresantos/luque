CREATE TYPE "public"."candidate_position_status" AS ENUM(
  'SHORTLISTED',
  'DISCARDED',
  'UNDER_REVIEW',
  'INTERVIEW',
  'OFFER',
  'HIRED',
  'REJECTED'
);--> statement-breakpoint
CREATE TABLE "candidate_positions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "position_id" uuid NOT NULL,
  "candidate_profile_id" uuid NOT NULL,
  "status" "candidate_position_status" NOT NULL,
  "decided_by_user_id" uuid,
  "decided_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "candidate_position_histories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "candidate_position_id" uuid NOT NULL,
  "from_status" "candidate_position_status",
  "to_status" "candidate_position_status" NOT NULL,
  "changed_by_user_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "candidate_positions" ADD CONSTRAINT "candidate_positions_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_positions" ADD CONSTRAINT "candidate_positions_candidate_profile_id_candidate_profiles_id_fk" FOREIGN KEY ("candidate_profile_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_positions" ADD CONSTRAINT "candidate_positions_decided_by_user_id_users_id_fk" FOREIGN KEY ("decided_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_position_histories" ADD CONSTRAINT "candidate_position_histories_candidate_position_id_candidate_positions_id_fk" FOREIGN KEY ("candidate_position_id") REFERENCES "public"."candidate_positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_position_histories" ADD CONSTRAINT "candidate_position_histories_changed_by_user_id_users_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "candidate_positions_position_candidate_idx" ON "candidate_positions" USING btree ("position_id","candidate_profile_id");--> statement-breakpoint
