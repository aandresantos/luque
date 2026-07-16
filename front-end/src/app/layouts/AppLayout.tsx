import { Building2, BriefcaseBusiness, LayoutGrid, LogOut } from "lucide-react";
import { NavLink, Outlet, useLocation, useParams } from "react-router-dom";
import { Button, Card } from "../../shared/components";
import { cn } from "../../shared/lib/cn";
import { useLogout } from "../../modules/auth/hooks/useLogout";
import { useCurrentUser } from "../../modules/auth/hooks/useCurrentUser";

type AppNavItem = {
  label: string;
  to: string;
  icon: typeof LayoutGrid;
  exact?: boolean;
};

function buildNavigation(companyId?: string, teamId?: string): AppNavItem[] {
  const activeCompanyId = companyId ?? "company-demo";
  const activeTeamId = teamId ?? "team-demo";

  return [
    {
      label: "Workspace",
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
      label: "Positions",
      to: `/app/companies/${activeCompanyId}/teams/${activeTeamId}/positions`,
      icon: BriefcaseBusiness,
    },
  ];
}

function AppLayout() {
  const location = useLocation();
  const { companyId, teamId } = useParams();
  const navigation = buildNavigation(companyId, teamId);
  const logout = useLogout();
  const { user } = useCurrentUser();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-border bg-surface/90 lg:w-60 lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col px-4 py-4">
            <div className="flex items-center justify-between gap-3 border-b border-border px-2 pb-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  Luque
                </p>
                <h1 className="mt-2 text-sm font-semibold text-foreground">
                  Recruiting Workspace
                </h1>
              </div>
            </div>

            <nav className="mt-4 flex flex-col gap-1" aria-label="Primary">
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    className={({ isActive }) =>
                      cn(
                        "group relative flex items-center gap-3 rounded-[var(--radius-base)] px-3 py-2.5 text-sm text-muted transition-colors",
                        "hover:bg-white/5 hover:text-foreground",
                        isActive && "bg-white/6 text-foreground",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={cn(
                            "absolute inset-y-2 left-0 w-0.5 rounded-full bg-transparent transition-colors",
                            isActive && "bg-primary",
                          )}
                          aria-hidden="true"
                        />
                        <Icon className="size-4 shrink-0" aria-hidden="true" />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <div className="mt-6 lg:mt-auto">
              <Card className="space-y-4 bg-background/70 p-4 shadow-none">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
                    Session
                  </p>
                  <p className="text-sm leading-6 text-muted">
                    {user ? `Conectado como ${user.name}.` : "Sessao ativa."}
                  </p>
                </div>
                <Button
                  className="w-full justify-center border border-border bg-transparent text-foreground shadow-none hover:bg-white/5"
                  icon={<LogOut className="size-4" aria-hidden="true" />}
                  loading={logout.isPending}
                  onClick={() => {
                    logout.mutate();
                  }}
                >
                  Logout
                </Button>
              </Card>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-border bg-background/85 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                  App Shell
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                  {location.pathname}
                </h2>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export { AppLayout };
