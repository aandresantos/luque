import { ClipboardCheck, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components";
import type { AuthenticatedUser } from "../../auth/types";

type DashboardHeaderProps = {
  user: AuthenticatedUser | null;
  primaryReviewPath: string;
};

function getGreetingByHour(date: Date) {
  const hour = date.getHours();

  if (hour < 12) {
    return "Bom dia";
  }

  if (hour < 18) {
    return "Boa tarde";
  }

  return "Boa noite";
}

function DashboardHeader({ user, primaryReviewPath }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const greeting = getGreetingByHour(new Date());
  const firstName = user?.name.split(" ")[0] ?? "time";

  return (
    <header className="border-b border-[#353437] pb-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-[4px] bg-[#201f22] px-2 py-1 text-[12px] tracking-[0.02em] text-[#c7c4d7]">
            <span>Luque HQ</span>
            <ChevronDown className="size-3 text-[#908fa0]" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <h1 className="text-[2rem] font-semibold tracking-[-0.02em] text-[#e5e1e4]">
              {greeting}, {firstName}
            </h1>
            <p className="text-base text-[#c7c4d7]">
              What recruitment decisions need my attention today?
            </p>
          </div>
        </div>

        <Button
          className="h-11 rounded-[4px] px-6 text-[12px] tracking-[0.02em] shadow-none"
          icon={<ClipboardCheck className="size-4" aria-hidden="true" />}
          onClick={() => {
            navigate(primaryReviewPath);
          }}
        >
          Avaliar candidatos
        </Button>
      </div>
    </header>
  );
}

export { DashboardHeader };
