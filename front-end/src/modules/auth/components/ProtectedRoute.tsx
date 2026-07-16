import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Button, ErrorState, Spinner } from "../../../shared/components";
import { useCurrentUser } from "../hooks/useCurrentUser";

type ProtectedRouteProps = {
  children?: ReactNode;
};

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { error, isLoading, isPending, isUnauthenticated, refetch, user } =
    useCurrentUser();

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

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
        <ErrorState
          title="Nao foi possivel validar sua sessao"
          description="Ocorreu um erro ao carregar a sessao atual. Tente novamente sem precisar sair da conta."
          action={<Button onClick={() => void refetch()}>Tentar novamente</Button>}
          className="w-full max-w-xl"
        />
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
