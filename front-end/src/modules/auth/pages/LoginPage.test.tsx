// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ApiError } from "../../../shared/api/api-error";
import { login } from "../api";
import { LoginPage } from "./LoginPage";

const useCurrentUserMock = vi.fn();

vi.mock("../hooks/useCurrentUser", async () => {
  const actual = await vi.importActual<
    typeof import("../hooks/useCurrentUser")
  >("../hooks/useCurrentUser");

  return {
    ...actual,
    useCurrentUser: () => useCurrentUserMock(),
  };
});

vi.mock("../api", async () => {
  const actual = await vi.importActual<typeof import("../api")>("../api");

  return {
    ...actual,
    login: vi.fn(),
  };
});

function renderLoginPage(initialEntries: string[] = ["/login"]) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app" element={<div>App page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("LoginPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.mocked(login).mockReset();
    useCurrentUserMock.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      isPending: false,
    });
  });

  it("validates the form before submit", async () => {
    const user = userEvent.setup();

    renderLoginPage();

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Informe um email valido")).toBeTruthy();
    expect(await screen.findByText("Informe sua senha")).toBeTruthy();
    expect(login).not.toHaveBeenCalled();
  });

  it("submits credentials and navigates on success", async () => {
    const user = userEvent.setup();

    vi.mocked(login).mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: {
        id: "user-1",
        name: "Jane Doe",
        email: "jane@example.com",
        type: "COMPANY_USER",
        status: "ACTIVE",
      },
    });

    renderLoginPage();

    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Senha"), "Password123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: "jane@example.com",
        password: "Password123",
      });
    });

    expect(await screen.findByText("App page")).toBeTruthy();
  });

  it("shows backend errors on failed login", async () => {
    const user = userEvent.setup();

    vi.mocked(login).mockRejectedValue(
      new ApiError("Invalid email or password", 401, {
        message: "Invalid email or password",
      }),
    );

    renderLoginPage();

    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Senha"), "wrong");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Invalid email or password")).toBeTruthy();
  });
});
