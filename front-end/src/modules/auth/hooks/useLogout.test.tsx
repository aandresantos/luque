// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { logout, setAuthAccessToken } from "../api";
import { currentUserQueryKey } from "./useCurrentUser";
import { useLogout } from "./useLogout";

vi.mock("../api", async () => {
  const actual = await vi.importActual<typeof import("../api")>("../api");

  return {
    ...actual,
    logout: vi.fn(),
  };
});

function LocationProbe() {
  const location = useLocation();

  return <div data-testid="location">{location.pathname}</div>;
}

function LogoutHarness() {
  const mutation = useLogout();

  return (
    <button
      type="button"
      onClick={() => {
        mutation.mutate();
      }}
    >
      Sair
    </button>
  );
}

describe("useLogout", () => {
  it("logs out, redirects to login and clears the cached session", async () => {
    const user = userEvent.setup();

    vi.mocked(logout).mockResolvedValue(undefined);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    queryClient.setQueryData(currentUserQueryKey, {
      id: "user-1",
      name: "Jane Doe",
      email: "jane@example.com",
      type: "COMPANY_USER",
      status: "ACTIVE",
    });
    setAuthAccessToken("token-123");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/app"]}>
          <Routes>
            <Route
              path="*"
              element={
                <>
                  <LocationProbe />
                  <LogoutHarness />
                </>
              }
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Sair" }));

    await waitFor(() => {
      expect(queryClient.getQueryData(currentUserQueryKey)).toBeNull();
    });

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe("/login");
    });
  });
});
