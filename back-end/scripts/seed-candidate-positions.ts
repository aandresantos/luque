import "dotenv/config";
import postgres from "postgres";

type CandidateSeed = {
  name: string;
  email: string;
  headline: string;
  summary: string;
  location: string;
  seniority: "JUNIOR" | "MID_LEVEL" | "SENIOR" | "STAFF";
};

type CandidateProfileRecord = {
  id: string;
  userId: string;
  fullName: string;
};

type PositionRecord = {
  id: string;
  title: string;
};

type DecisionUserRecord = {
  id: string;
};

type CandidatePositionStatus =
  | "SHORTLISTED"
  | "UNDER_REVIEW"
  | "INTERVIEW"
  | "OFFER";

const TARGET_RELATIONS = 30;

const candidateSeeds: CandidateSeed[] = [
  {
    name: "Ana Souza",
    email: "seed.candidate.01@luque.local",
    headline: "Backend engineer focused on TypeScript APIs",
    summary: "Builds Fastify and Node services with attention to reliability.",
    location: "Sao Paulo, BR",
    seniority: "MID_LEVEL",
  },
  {
    name: "Bruno Lima",
    email: "seed.candidate.02@luque.local",
    headline: "Frontend engineer for React and design systems",
    summary: "Improves UI quality with React, accessibility, and testing.",
    location: "Campinas, BR",
    seniority: "MID_LEVEL",
  },
  {
    name: "Carla Mendes",
    email: "seed.candidate.03@luque.local",
    headline: "Full stack engineer with product delivery experience",
    summary: "Works across APIs and web apps with pragmatic delivery.",
    location: "Rio de Janeiro, BR",
    seniority: "SENIOR",
  },
  {
    name: "Diego Rocha",
    email: "seed.candidate.04@luque.local",
    headline: "Platform engineer for cloud and observability",
    summary: "Improves developer experience with infrastructure automation.",
    location: "Belo Horizonte, BR",
    seniority: "SENIOR",
  },
  {
    name: "Eduarda Nunes",
    email: "seed.candidate.05@luque.local",
    headline: "QA engineer with automation background",
    summary: "Expands regression coverage with end-to-end and API suites.",
    location: "Curitiba, BR",
    seniority: "MID_LEVEL",
  },
  {
    name: "Felipe Costa",
    email: "seed.candidate.06@luque.local",
    headline: "Data engineer for analytics pipelines",
    summary: "Builds ETL jobs and reporting layers for product teams.",
    location: "Recife, BR",
    seniority: "SENIOR",
  },
  {
    name: "Gabriela Martins",
    email: "seed.candidate.07@luque.local",
    headline: "Mobile engineer with React Native experience",
    summary: "Ships polished mobile features with strong collaboration habits.",
    location: "Fortaleza, BR",
    seniority: "MID_LEVEL",
  },
  {
    name: "Henrique Alves",
    email: "seed.candidate.08@luque.local",
    headline: "DevOps engineer for CI and release pipelines",
    summary: "Reduces deployment friction and improves build stability.",
    location: "Porto Alegre, BR",
    seniority: "SENIOR",
  },
  {
    name: "Isabela Freitas",
    email: "seed.candidate.09@luque.local",
    headline: "Product engineer with discovery mindset",
    summary: "Connects user needs to measurable product outcomes.",
    location: "Salvador, BR",
    seniority: "MID_LEVEL",
  },
  {
    name: "Joao Pedro Silva",
    email: "seed.candidate.10@luque.local",
    headline: "Junior engineer growing in backend development",
    summary: "Learns quickly and contributes with clear communication.",
    location: "Florianopolis, BR",
    seniority: "JUNIOR",
  },
];

const getTargetStatus = (index: number): CandidatePositionStatus => {
  const bucket = index % 10;

  if (bucket <= 4) return "SHORTLISTED";
  if (bucket <= 7) return "UNDER_REVIEW";
  if (bucket === 8) return "INTERVIEW";
  return "OFFER";
};

const getHistorySteps = (
  status: CandidatePositionStatus,
): CandidatePositionStatus[] => {
  switch (status) {
    case "SHORTLISTED":
      return ["SHORTLISTED"];
    case "UNDER_REVIEW":
      return ["SHORTLISTED", "UNDER_REVIEW"];
    case "INTERVIEW":
      return ["SHORTLISTED", "UNDER_REVIEW", "INTERVIEW"];
    case "OFFER":
      return ["SHORTLISTED", "UNDER_REVIEW", "INTERVIEW", "OFFER"];
  }
};

const main = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to seed candidate positions.");
  }

  const sql = postgres(process.env.DATABASE_URL);

  try {
    const positions = await sql<PositionRecord[]>`
      select id, title
      from positions
      where status = 'OPEN'
      order by created_at asc
    `;

    if (positions.length === 0) {
      throw new Error("No open positions found. Create at least one open position first.");
    }

    let [decisionUser] = await sql<DecisionUserRecord[]>`
      select id
      from users
      where type = 'COMPANY_USER'
        and status = 'ACTIVE'
      order by created_at asc
      limit 1
    `;

    if (!decisionUser) {
      [decisionUser] = await sql<DecisionUserRecord[]>`
        insert into users (name, email, type, status)
        values (
          'Seed Recruiter',
          'seed.recruiter@luque.local',
          'COMPANY_USER',
          'ACTIVE'
        )
        on conflict (email) do update
        set
          name = excluded.name,
          type = excluded.type,
          status = excluded.status,
          updated_at = now()
        returning id
      `;
    }

    const seededProfiles: CandidateProfileRecord[] = [];

    for (const [index, candidate] of candidateSeeds.entries()) {
      const [user] = await sql<{ id: string }[]>`
        insert into users (name, email, type, status)
        values (
          ${candidate.name},
          ${candidate.email},
          'CANDIDATE',
          'ACTIVE'
        )
        on conflict (email) do update
        set
          name = excluded.name,
          type = excluded.type,
          status = excluded.status,
          updated_at = now()
        returning id
      `;

      const [profile] = await sql<CandidateProfileRecord[]>`
        insert into candidate_profiles (
          user_id,
          full_name,
          headline,
          summary,
          location,
          seniority,
          availability_status,
          status
        )
        values (
          ${user.id},
          ${candidate.name},
          ${candidate.headline},
          ${candidate.summary},
          ${candidate.location},
          ${candidate.seniority},
          'OPEN_TO_WORK',
          'ACTIVE'
        )
        on conflict (user_id) do update
        set
          full_name = excluded.full_name,
          headline = excluded.headline,
          summary = excluded.summary,
          location = excluded.location,
          seniority = excluded.seniority,
          availability_status = excluded.availability_status,
          status = excluded.status,
          updated_at = now()
        returning id, user_id as "userId", full_name as "fullName"
      `;

      seededProfiles.push(profile);

      if (index >= 7 && seededProfiles.length * positions.length >= TARGET_RELATIONS) {
        break;
      }
    }

    const desiredRelations = seededProfiles.flatMap((profile) =>
      positions.map((position) => ({
        positionId: position.id,
        candidateProfileId: profile.id,
      })),
    );

    let insertedCount = 0;

    for (const [index, relation] of desiredRelations.entries()) {
      if (insertedCount >= TARGET_RELATIONS) break;

      const finalStatus = getTargetStatus(index);
      const decidedAt = new Date(Date.now() - (TARGET_RELATIONS - index) * 60 * 60 * 1000);

      const [created] = await sql<{ id: string }[]>`
        insert into candidate_positions (
          position_id,
          candidate_profile_id,
          status,
          decided_by_user_id,
          decided_at,
          created_at,
          updated_at
        )
        values (
          ${relation.positionId},
          ${relation.candidateProfileId},
          ${finalStatus},
          ${decisionUser.id},
          ${decidedAt},
          ${decidedAt},
          ${decidedAt}
        )
        on conflict (position_id, candidate_profile_id) do nothing
        returning id
      `;

      if (!created) continue;

      const historySteps = getHistorySteps(finalStatus);

      for (const [historyIndex, toStatus] of historySteps.entries()) {
        const fromStatus = historyIndex === 0 ? null : historySteps[historyIndex - 1];
        const historyCreatedAt = new Date(
          decidedAt.getTime() - (historySteps.length - historyIndex - 1) * 15 * 60 * 1000,
        );

        await sql`
          insert into candidate_position_histories (
            candidate_position_id,
            from_status,
            to_status,
            changed_by_user_id,
            created_at
          )
          values (
            ${created.id},
            ${fromStatus},
            ${toStatus},
            ${decisionUser.id},
            ${historyCreatedAt}
          )
        `;
      }

      insertedCount += 1;
    }

    const [summary] = await sql<{
      candidatePositions: number;
      candidateProfiles: number;
    }[]>`
      select
        (select count(*) from candidate_positions)::int as "candidatePositions",
        (select count(*) from candidate_profiles where status = 'ACTIVE')::int as "candidateProfiles"
    `;

    console.log(
      JSON.stringify(
        {
          openPositions: positions.length,
          activeCandidateProfiles: summary.candidateProfiles,
          insertedCandidatePositions: insertedCount,
          totalCandidatePositions: summary.candidatePositions,
        },
        null,
        2,
      ),
    );
  } finally {
    await sql.end();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
