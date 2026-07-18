CREATE TYPE "public"."candidate_recommendation_status" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'REVIEW_LATER');
CREATE TYPE "public"."candidate_recommendation_source" AS ENUM('MANUAL', 'SEED', 'MATCHING_JOB');

CREATE TABLE "candidate_recommendations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "position_id" uuid NOT NULL,
  "candidate_profile_id" uuid NOT NULL,
  "status" "candidate_recommendation_status" DEFAULT 'PENDING' NOT NULL,
  "source" "candidate_recommendation_source" DEFAULT 'MANUAL' NOT NULL,
  "score" integer,
  "matching_version" varchar(100),
  "reason" text,
  "generated_at" timestamp DEFAULT now() NOT NULL,
  "decided_at" timestamp,
  "decided_by_membership_id" uuid,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "candidate_recommendation_score_range_check" CHECK ("candidate_recommendations"."score" IS NULL OR ("candidate_recommendations"."score" >= 0 AND "candidate_recommendations"."score" <= 100))
);

CREATE TABLE "candidate_recommendation_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "recommendation_id" uuid NOT NULL,
  "from_status" "candidate_recommendation_status",
  "to_status" "candidate_recommendation_status" NOT NULL,
  "changed_by_membership_id" uuid,
  "created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "candidate_recommendations"
  ADD CONSTRAINT "candidate_recommendations_position_id_positions_id_fk"
  FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "candidate_recommendations"
  ADD CONSTRAINT "candidate_recommendations_candidate_profile_id_candidate_profiles_id_fk"
  FOREIGN KEY ("candidate_profile_id") REFERENCES "public"."candidate_profiles"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "candidate_recommendations"
  ADD CONSTRAINT "candidate_recommendations_decided_by_membership_id_company_memberships_id_fk"
  FOREIGN KEY ("decided_by_membership_id") REFERENCES "public"."company_memberships"("id")
  ON DELETE set null ON UPDATE no action;

ALTER TABLE "candidate_recommendation_history"
  ADD CONSTRAINT "candidate_recommendation_history_recommendation_id_candidate_recommendations_id_fk"
  FOREIGN KEY ("recommendation_id") REFERENCES "public"."candidate_recommendations"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "candidate_recommendation_history"
  ADD CONSTRAINT "candidate_recommendation_history_changed_by_membership_id_company_memberships_id_fk"
  FOREIGN KEY ("changed_by_membership_id") REFERENCES "public"."company_memberships"("id")
  ON DELETE set null ON UPDATE no action;

CREATE UNIQUE INDEX "candidate_recommendation_position_candidate_unique"
  ON "candidate_recommendations" USING btree ("position_id", "candidate_profile_id");
CREATE INDEX "candidate_recommendation_position_status_idx"
  ON "candidate_recommendations" USING btree ("position_id", "status");
CREATE INDEX "candidate_recommendation_candidate_idx"
  ON "candidate_recommendations" USING btree ("candidate_profile_id");
