import type {
  JobSummary,
  PendingCandidate,
  RecentActivityItem,
  ShortlistSummary,
} from "./types";

export const openJobs: JobSummary[] = [
  {
    id: "position-backend",
    title: "Senior Backend Engineer",
    team: "Engineering",
    location: "Remote, BR",
    newCandidates: 8,
    totalCandidates: 32,
    pipeline: {
      shortlisted: 8,
      review: 16,
      interview: 8,
    },
    reviewPath: "/app/positions/position-backend/swipe",
  },
  {
    id: "position-frontend",
    title: "Frontend React Engineer",
    team: "Engineering",
    location: "Sao Paulo, SP (Hybrid)",
    newCandidates: 5,
    totalCandidates: 18,
    pipeline: {
      shortlisted: 9,
      review: 6,
      interview: 3,
    },
    reviewPath: "/app/positions/position-frontend/swipe",
  },
];

export const shortlists: ShortlistSummary[] = [
  {
    id: "shortlist-product",
    title: "Product Designer",
    status: "Waiting for HM feedback",
    candidateCount: 3,
  },
  {
    id: "shortlist-data",
    title: "Data Engineer",
    status: "Ready for review",
    candidateCount: 2,
  },
];

export const pendingCandidates: PendingCandidate[] = [
  {
    id: "candidate-lucas",
    name: "Lucas Silva",
    appliedAt: "Applied 2 days ago",
    jobTitle: "Senior Backend Engineer",
    matchScore: 92,
    initials: "LS",
  },
  {
    id: "candidate-camila",
    name: "Camila Jardim",
    appliedAt: "Applied 3 days ago",
    jobTitle: "Frontend React Engineer",
    matchScore: 88,
    initials: "CJ",
  },
];

export const recentActivities: RecentActivityItem[] = [
  {
    id: "activity-marina",
    content: "Marina Oliveira aprovada para Backend.",
    timestamp: "2 hours ago by Diego M.",
    highlighted: true,
  },
  {
    id: "activity-roberto",
    content: "Offer sent to Roberto Alves.",
    timestamp: "5 hours ago by You",
  },
  {
    id: "activity-product",
    content: "Product Designer role opened.",
    timestamp: "1 day ago",
  },
];
