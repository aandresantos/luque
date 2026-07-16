import { Navigate, createBrowserRouter, useParams } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { Badge, Card } from "../../shared/components";
import { ProtectedRoute } from "../../modules/auth/components/ProtectedRoute";
import { LoginPage } from "../../modules/auth/pages/LoginPage";

function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const params = useParams();
  const entries = Object.entries(params);

  return (
    <Card className="space-y-5">
      <div className="space-y-2">
        <Badge tone="primary">Placeholder</Badge>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted">
            {description}
          </p>
        </div>
      </div>

      {entries.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {entries.map(([key, value]) => (
            <div
              key={key}
              className="rounded-[var(--radius-base)] border border-border bg-background/80 p-4"
            >
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
                {key}
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {value}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">
          Nenhum parametro de rota foi resolvido nesta view.
        </p>
      )}
    </Card>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/app" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <PlaceholderPage
            title="Workspace overview"
            description="Ponto de entrada protegido do app, pronto para receber os modulos de dominio."
          />
        ),
      },
      {
        path: "companies/:companyId",
        element: (
          <PlaceholderPage
            title="Company placeholder"
            description="Contexto navegavel da company atual extraido da URL."
          />
        ),
      },
      {
        path: "companies/:companyId/teams/:teamId",
        element: (
          <PlaceholderPage
            title="Team placeholder"
            description="View minima para o contexto de team antes da implementacao do modulo."
          />
        ),
      },
      {
        path: "companies/:companyId/teams/:teamId/positions",
        element: (
          <PlaceholderPage
            title="Positions placeholder"
            description="Lista de positions ainda nao implementada; a rota ja esta preparada."
          />
        ),
      },
      {
        path: "positions/:positionId",
        element: (
          <PlaceholderPage
            title="Position detail placeholder"
            description="Detalhe de position reservado para a futura integracao de dominio."
          />
        ),
      },
      {
        path: "positions/:positionId/review",
        element: (
          <PlaceholderPage
            title="Review placeholder"
            description="Espaco reservado para a etapa de review da position."
          />
        ),
      },
    ],
  },
]);
