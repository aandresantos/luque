import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { ApiError } from "../../../shared/api/api-error";
import { Button, Card, ErrorState, Input } from "../../../shared/components";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useLogin } from "../hooks/useLogin";
import type { LoginInput } from "../types";

const loginSchema = z.object({
  email: z.string().email("Informe um email valido"),
  password: z.string().min(1, "Informe sua senha"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginLocationState = {
  from?: {
    pathname?: string;
  };
};

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const { isAuthenticated, isLoading, isPending } = useCurrentUser();
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const targetPath =
    (location.state as LoginLocationState | null)?.from?.pathname ?? "/app";
  const errorMessage =
    login.error instanceof ApiError
      ? login.error.message
      : login.error instanceof Error
        ? login.error.message
        : null;

  useEffect(() => {
    if (login.isSuccess) {
      navigate(targetPath, { replace: true });
    }
  }, [login.isSuccess, navigate, targetPath]);

  if (isLoading || isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
        <Card className="w-full max-w-md">
          <p className="text-sm text-muted">Verificando sessao atual...</p>
        </Card>
      </main>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={targetPath} replace />;
  }

  const onSubmit = (values: LoginInput) => {
    login.mutate(values);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <Card className="w-full max-w-md space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            Auth
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Entrar no Luque
          </h1>
          <p className="text-sm leading-6 text-muted">
            Use seu email e senha para acessar a area protegida da aplicacao.
          </p>
        </div>

        {errorMessage ? (
          <ErrorState
            title="Nao foi possivel autenticar"
            description={errorMessage}
          />
        ) : null}

        <form
          className="space-y-4"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="email"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
            {errors.email ? (
              <p
                id="email-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="password"
            >
              Senha
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
            {errors.password ? (
              <p
                id="password-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <Button className="w-full" type="submit" loading={login.isPending}>
            Entrar
          </Button>
        </form>
      </Card>
    </main>
  );
}

export { LoginPage };
