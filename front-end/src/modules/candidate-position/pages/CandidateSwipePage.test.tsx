// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ApiError } from "../../../shared/api/api-error";
import { CandidateSwipePage } from "./CandidateSwipePage";
import type { CandidateForSwipe } from "../types";

const usePendingCandidatesMock = vi.fn();
const useReviewCandidateMock = vi.fn();
const useCandidateExperiencesMock = vi.fn();
const useCandidateNotesMock = vi.fn();

vi.mock("../hooks/usePendingCandidates", () => ({
  usePendingCandidates: (positionId: string | undefined) =>
    usePendingCandidatesMock(positionId),
}));

vi.mock("../hooks/useReviewCandidate", () => ({
  useReviewCandidate: (positionId: string | undefined) =>
    useReviewCandidateMock(positionId),
}));

vi.mock("../hooks/useCandidateExperiences", () => ({
  useCandidateExperiences: (
    candidateId: string | undefined,
    enabled: boolean,
  ) => useCandidateExperiencesMock(candidateId, enabled),
}));

vi.mock("../hooks/useCandidateNotes", () => ({
  useCandidateNotes: (
    candidatePositionId: string | undefined,
    enabled: boolean,
  ) => useCandidateNotesMock(candidatePositionId, enabled),
}));

const candidates: CandidateForSwipe[] = [
  {
    candidatePositionId: "candidate-position-1",
    candidateProfileId: "candidate-profile-1",
    status: "SHORTLISTED",
    candidate: {
      id: "candidate-profile-1",
      name: "Marina Oliveira",
      headline: "Senior Backend Engineer",
      summary: "Backend expert focused on scalability.",
      location: "Sao Paulo - Remoto",
      avatarUrl: null,
      experienceYears: null,
      availability: "Open to work",
      salaryExpectation: null,
      matchPercentage: null,
      skills: [],
    },
    position: {
      id: "position-1",
      title: "Senior Backend Engineer",
    },
  },
  {
    candidatePositionId: "candidate-position-2",
    candidateProfileId: "candidate-profile-2",
    status: "REVIEW_LATER",
    candidate: {
      id: "candidate-profile-2",
      name: "Camila Jardim",
      headline: "Frontend React Engineer",
      summary: "Strong UI engineering background.",
      location: "Sao Paulo",
      avatarUrl: null,
      experienceYears: null,
      availability: "Not looking",
      salaryExpectation: null,
      matchPercentage: null,
      skills: [],
    },
    position: {
      id: "position-1",
      title: "Senior Backend Engineer",
    },
  },
];

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderSwipePage(initialEntries = ["/app/positions/position-1/swipe"]) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route
            path="/app/positions/:positionId/swipe"
            element={<CandidateSwipePage />}
          />
          <Route
            path="/app/candidate-profiles/:candidateProfileId"
            element={<div>Candidate profile page</div>}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("CandidateSwipePage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();

    usePendingCandidatesMock.mockReturnValue({
      position: {
        id: "position-1",
        title: "Senior Backend Engineer",
      },
      candidates,
      isLoading: false,
      error: null,
    });

    useReviewCandidateMock.mockReturnValue({
      isPending: false,
      mutate: vi.fn((_input, options) => {
        options?.onSuccess?.();
      }),
    });

    useCandidateExperiencesMock.mockReturnValue({
      data: [],
      isSupported: false,
    });

    useCandidateNotesMock.mockReturnValue({
      data: [],
      isSupported: false,
    });
  });

  it("uses the positionId from the URL and shows loading state", () => {
    usePendingCandidatesMock.mockReturnValue({
      position: null,
      candidates: [],
      isLoading: true,
      error: null,
    });

    renderSwipePage();

    expect(usePendingCandidatesMock).toHaveBeenCalledWith("position-1");
    expect(screen.queryByText("Marina Oliveira")).toBeNull();
  });

  it("shows a specific not found state", () => {
    usePendingCandidatesMock.mockReturnValue({
      position: null,
      candidates: [],
      isLoading: false,
      error: new ApiError("Not found", 404),
    });

    renderSwipePage();

    expect(screen.getByText("Vaga inexistente")).toBeTruthy();
  });

  it("shows the empty state when there are no pending candidates", () => {
    usePendingCandidatesMock.mockReturnValue({
      position: {
        id: "position-1",
        title: "Senior Backend Engineer",
      },
      candidates: [],
      isLoading: false,
      error: null,
    });

    renderSwipePage();

    expect(screen.getByText("Nenhum candidato pendente")).toBeTruthy();
  });

  it("approves the current candidate and advances to the next one", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn((_input, options) => {
      options?.onSuccess?.();
    });
    useReviewCandidateMock.mockReturnValue({
      isPending: false,
      mutate,
    });

    renderSwipePage();

    expect(
      screen.getByRole("heading", { name: "Marina Oliveira", level: 2 }),
    ).toBeTruthy();
    await user.click(screen.getAllByRole("button", { name: /aprovar/i })[0]);

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "approve",
        positionId: "position-1",
        candidatePositionId: "candidate-position-1",
      }),
      expect.any(Object),
    );
    expect(
      await screen.findByRole("heading", {
        name: "Camila Jardim",
        level: 2,
      }),
    ).toBeTruthy();
  });

  it("opens the profile without changing status", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();
    useReviewCandidateMock.mockReturnValue({
      isPending: false,
      mutate,
    });

    renderSwipePage();

    await user.click(
      screen.getAllByRole("button", { name: /abrir perfil/i })[0],
    );

    expect(screen.getByText("Candidate profile page")).toBeTruthy();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("rejects on swipe left and approves on swipe right", () => {
    const mutate = vi.fn();
    useReviewCandidateMock.mockReturnValue({
      isPending: false,
      mutate,
    });

    renderSwipePage();

    const card = screen
      .getByRole("heading", { name: "Marina Oliveira", level: 2 })
      .closest("article")?.parentElement;

    if (!card) {
      throw new Error("Swipe card container not found");
    }

    fireEvent.pointerDown(card, { clientX: 300, pointerId: 1 });
    fireEvent.pointerMove(card, { clientX: 80, pointerId: 1 });
    fireEvent.pointerUp(card, { pointerId: 1 });

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ action: "reject" }),
      expect.any(Object),
    );

    fireEvent.pointerDown(card, { clientX: 100, pointerId: 2 });
    fireEvent.pointerMove(card, { clientX: 320, pointerId: 2 });
    fireEvent.pointerUp(card, { pointerId: 2 });

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ action: "approve" }),
      expect.any(Object),
    );
  });

  it("does not trigger a decision below the swipe threshold", () => {
    const mutate = vi.fn();
    useReviewCandidateMock.mockReturnValue({
      isPending: false,
      mutate,
    });

    renderSwipePage();

    const card = screen
      .getByRole("heading", { name: "Marina Oliveira", level: 2 })
      .closest("article")?.parentElement;

    if (!card) {
      throw new Error("Swipe card container not found");
    }

    fireEvent.pointerDown(card, { clientX: 200, pointerId: 1 });
    fireEvent.pointerMove(card, { clientX: 260, pointerId: 1 });
    fireEvent.pointerUp(card, { pointerId: 1 });

    expect(mutate).not.toHaveBeenCalled();
  });

  it("keeps the current candidate visible and shows feedback on mutation error", async () => {
    const user = userEvent.setup();
    useReviewCandidateMock.mockReturnValue({
      isPending: false,
      mutate: vi.fn((_input, options) => {
        options?.onError?.(new ApiError("Conflict", 409));
      }),
    });

    renderSwipePage();

    await user.click(screen.getAllByRole("button", { name: /rejeitar/i })[0]);

    expect(screen.getByText("Conflict")).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Marina Oliveira", level: 2 }),
    ).toBeTruthy();
  });

  it("keeps actions disabled during mutation and prevents duplicate submission", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();
    useReviewCandidateMock.mockReturnValue({
      isPending: true,
      mutate,
    });

    renderSwipePage();

    const approveButton = screen.getAllByRole("button", {
      name: /aprovar/i,
    })[0];
    expect(approveButton.hasAttribute("disabled")).toBe(true);

    await user.click(approveButton);

    expect(mutate).not.toHaveBeenCalled();
  });

  it("opens and closes the details panel, including Escape, and resets after success", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn((_input, options) => {
      options?.onSuccess?.();
    });
    useReviewCandidateMock.mockReturnValue({
      isPending: false,
      mutate,
    });

    renderSwipePage();

    const detailsToggle = screen.getAllByRole("button", {
      name: /abrir details/i,
    })[0];
    expect(detailsToggle.getAttribute("aria-expanded")).toBe("false");

    await user.click(detailsToggle);

    expect(detailsToggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Historico indisponivel")).toBeTruthy();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(detailsToggle.getAttribute("aria-expanded")).toBe("false");

    await user.click(detailsToggle);
    await user.click(screen.getAllByRole("button", { name: /aprovar/i })[0]);

    expect(
      screen.getByRole("heading", { name: "Camila Jardim", level: 2 }),
    ).toBeTruthy();
    expect(detailsToggle.getAttribute("aria-expanded")).toBe("false");
  });
});
