import {
  BriefcaseBusiness,
  Building2,
  LayoutGrid,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { NavLink, useParams } from "react-router-dom";
import { Button } from "../../shared/components";
import { cn } from "../../shared/lib/cn";
import { useCurrentUser } from "../../modules/auth/hooks/useCurrentUser";
import { useLogout } from "../../modules/auth/hooks/useLogout";

type AppNavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  exact?: boolean;
};

function buildNavigation(companyId?: string, teamId?: string): AppNavItem[] {
  const activeCompanyId = companyId ?? "company-demo";
  const activeTeamId = teamId ?? "team-demo";

  return [
    {
      label: "Overview",
      to: "/app",
      icon: LayoutGrid,
      exact: true,
    },
    {
      label: "Company",
      to: `/app/companies/${activeCompanyId}`,
      icon: Building2,
    },
    {
      label: "Jobs",
      to: `/app/companies/${activeCompanyId}/teams/${activeTeamId}/positions`,
      icon: BriefcaseBusiness,
    },
  ];
}

function AppSidebar() {
  const { companyId, teamId } = useParams();
  const navigation = buildNavigation(companyId, teamId);
  const logout = useLogout();
  const { user } = useCurrentUser();

  return (
    <aside className="border-b border-[#464554] bg-[#1c1b1d] lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col px-3 py-6">
        <div className="flex items-center gap-4 px-3">
          <div className="flex size-10 items-center justify-center rounded-[4px] border border-white/8 bg-[radial-gradient(circle_at_top,_rgba(124,137,255,0.32),_transparent_55%),_linear-gradient(180deg,_#2d2a36_0%,_#19181c_100%)] shadow-[0_10px_28px_rgba(0,0,0,0.32)]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              LQ
            </span>
          </div>

          <div>
            <p className="text-[1.125rem] font-semibold leading-6 tracking-[-0.01em] text-[#e5e1e4]">
              Luque
            </p>
            <p className="text-[0.7rem] leading-[1.05rem] tracking-[0.03em] text-[#c7c4d7]">
              Recruitment
            </p>
            <p className="text-[0.7rem] leading-[1.05rem] tracking-[0.03em] text-[#c7c4d7]">
              SaaS
            </p>
          </div>
        </div>

        <nav className="mt-10 flex flex-col gap-1 px-2" aria-label="Primary">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-4 rounded-[4px] px-4 py-2 text-[0.8125rem] text-[#c7c4d7] transition-colors",
                    "hover:bg-white/4 hover:text-[#f2efff]",
                    isActive &&
                      "border-l-2 border-primary bg-[rgba(57,72,90,0.1)] pl-[14px] text-[#c0c1ff]",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        "size-[0.95rem] shrink-0",
                        isActive && "text-[#c0c1ff]",
                      )}
                      aria-hidden="true"
                    />
                    <span className={cn(isActive && "font-semibold")}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-8 px-3 text-[0.7rem] leading-5 text-[#9b98ab] lg:mt-auto">
          <p className="truncate">{user ? user.name : "Sessao ativa"}</p>
          <Button
            className="mt-3 w-full justify-center border border-white/10 bg-transparent text-[#e5e1e4] shadow-none hover:bg-white/5"
            icon={<LogOut className="size-4" aria-hidden="true" />}
            loading={logout.isPending}
            onClick={() => {
              logout.mutate();
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}

export { AppSidebar };
