export type JobSummary = {
  id: string;
  title: string;
  team: string;
  location: string;
  newCandidates: number;
  totalCandidates: number;
  pipeline: {
    shortlisted: number;
    review: number;
    interview: number;
  };
  reviewPath: string;
};

export type ShortlistSummary = {
  id: string;
  title: string;
  status: string;
  candidateCount: number;
};

export type PendingCandidate = {
  id: string;
  name: string;
  appliedAt: string;
  jobTitle: string;
  matchScore: number;
  initials: string;
};

export type RecentActivityItem = {
  id: string;
  content: string;
  timestamp: string;
  highlighted?: boolean;
};
