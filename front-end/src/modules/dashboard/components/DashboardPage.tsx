import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import {
  openJobs,
  pendingCandidates,
  recentActivities,
  shortlists,
} from "../mock-data";
import { DashboardHeader } from "./DashboardHeader";
import { OpenJobsSection } from "./OpenJobsSection";
import { PendingCandidatesSection } from "./PendingCandidatesSection";
import { RecentActivitySection } from "./RecentActivitySection";
import { ShortlistsSection } from "./ShortlistsSection";

function DashboardPage() {
  const { user } = useCurrentUser();
  const primaryReviewPath =
    openJobs[0]?.reviewPath ?? "/app/positions/position-backend/swipe";

  return (
    <div className="flex flex-col gap-8 p-6 sm:p-8 xl:gap-10 xl:p-10">
      <DashboardHeader user={user} primaryReviewPath={primaryReviewPath} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_300px]">
        <OpenJobsSection jobs={openJobs} />
        <ShortlistsSection shortlists={shortlists} />
        <PendingCandidatesSection
          candidates={pendingCandidates}
          reviewPath={primaryReviewPath}
        />
        <RecentActivitySection items={recentActivities} />
      </div>
    </div>
  );
}

export { DashboardPage };
