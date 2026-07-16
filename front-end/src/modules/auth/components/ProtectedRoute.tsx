import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spinner } from "../../../shared/components";
import { useCurrentUser } from "../hooks/useCurrentUser";

type ProtectedRouteProps = {
  children?: ReactNode;
};

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isLoading, isPending, isUnauthenticated, user } = useCurrentUser();

  if (isLoading || isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex items-center gap-3 text-sm text-muted">
          <Spinner />
          <span>Carregando sessao</span>
        </div>
      </main>
    );
  }

  if (isUnauthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: location.pathname } }}
      />
    );
  }

  return children ? <>{children}</> : <Outlet />;
}

export { ProtectedRoute };
