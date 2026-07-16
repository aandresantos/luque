// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

const useCurrentUserMock = vi.fn();

vi.mock("../hooks/useCurrentUser", () => ({
  useCurrentUser: () => useCurrentUserMock(),
}));

describe("ProtectedRoute", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a loading state while the session is loading", () => {
    useCurrentUserMock.mockReturnValue({
      isLoading: true,
      isPending: true,
      isUnauthenticated: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={["/app"]}>
        <ProtectedRoute>
          <div>Private content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText("Carregando sessao")).toBeTruthy();
  });

  it("redirects unauthenticated users to login", () => {
    useCurrentUserMock.mockReturnValue({
      isLoading: false,
      isPending: false,
      isUnauthenticated: true,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={["/app"]}>
        <Routes>
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <div>Private content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login screen</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login screen")).toBeTruthy();
  });

  it("shows a recoverable error state instead of redirecting on session errors", async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();

    useCurrentUserMock.mockReturnValue({
      error: new Error("boom"),
      isLoading: false,
      isPending: false,
      isUnauthenticated: false,
      refetch,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={["/app"]}>
        <Routes>
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <div>Private content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login screen</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Nao foi possivel validar sua sessao"),
    ).toBeTruthy();
    expect(screen.queryByText("Login screen")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders authenticated content", () => {
    useCurrentUserMock.mockReturnValue({
      isLoading: false,
      isPending: false,
      isUnauthenticated: false,
      user: {
        id: "user-1",
        name: "Jane Doe",
        email: "jane@example.com",
        type: "COMPANY_USER",
        status: "ACTIVE",
      },
    });

    render(
      <MemoryRouter initialEntries={["/app"]}>
        <ProtectedRoute>
          <div>Private content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText("Private content")).toBeTruthy();
  });
});
