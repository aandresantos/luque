export type CandidatePositionStatus =
  | "SHORTLISTED"
  | "REVIEW_LATER"
  | "DISCARDED"
  | "UNDER_REVIEW"
  | "INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED";

export type CandidateDetailsTab = "experience" | "notes";

export interface PositionResponse {
  id: string;
  teamId: string;
  title: string;
  description: string | null;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  updatedAt: string;
}

export interface CandidatePositionResponse {
  id: string;
  positionId: string;
  candidateProfileId: string;
  status: CandidatePositionStatus;
  decidedByUserId: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateProfileResponse {
  id: string;
  userId: string;
  fullName: string;
  headline: string | null;
  summary: string | null;
  location: string | null;
  photoUrl: string | null;
  seniority: string | null;
  availabilityStatus: "OPEN_TO_WORK" | "NOT_LOOKING";
  status: "ACTIVE" | "DEACTIVATED";
  createdAt: string;
  updatedAt: string;
}

export interface CandidateForSwipe {
  candidatePositionId: string;
  candidateProfileId: string;
  status: CandidatePositionStatus;
  candidate: {
    id: string;
    name: string;
    headline: string | null;
    summary: string | null;
    location: string | null;
    avatarUrl: string | null;
    experienceYears: number | null;
    availability: string | null;
    salaryExpectation: string | null;
    matchPercentage: number | null;
    skills: Array<{
      id: string;
      name: string;
    }>;
  };
  position: {
    id: string;
    title: string;
  };
}

export interface UpdateCandidatePositionStatusInput {
  status: Extract<CandidatePositionStatus, "REVIEW_LATER" | "UNDER_REVIEW">;
}

export interface CandidateExperience {
  id: string;
  companyName: string;
  role: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
}

export interface CandidatePositionNote {
  id: string;
  candidatePositionId: string;
  author: {
    id: string;
    name: string;
  };
  content: string;
  createdAt: string;
}

export type CandidateReviewAction = "approve" | "reject" | "reviewLater";
