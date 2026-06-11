/// <reference types="vitest/globals" />

import { describe, it, expect, vi, beforeEach } from "vitest";
import { teamService } from "./team.service.js";
import { teamRepository } from "./team.repository.js";

vi.mock("./team.repository.js");

const makeTeam = (overrides: Partial<Awaited<ReturnType<typeof teamRepository.findById>>> = {}) => ({
  id: "team-1",
  companyId: "company-1",
  name: "Engineering",
  description: null,
  status: "ACTIVE" as const,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});

describe("teamService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("createTeam", () => {
    it("creates and returns a new team when no name conflict exists", async () => {
      const input = { name: "Engineering", description: null };
      const created = makeTeam();

      vi.mocked(teamRepository.findByCompanyIdAndName).mockResolvedValue(undefined);
      vi.mocked(teamRepository.create).mockResolvedValue(created);

      const result = await teamService.createTeam("company-1", input);

      expect(result).toEqual(created);
      expect(teamRepository.findByCompanyIdAndName).toHaveBeenCalledWith("company-1", "Engineering");
      expect(teamRepository.create).toHaveBeenCalledWith("company-1", input);
    });

    it("throws 409 when a team with the same name already exists in the same company", async () => {
      const input = { name: "Engineering", description: null };

      vi.mocked(teamRepository.findByCompanyIdAndName).mockResolvedValue(makeTeam());

      await expect(teamService.createTeam("company-1", input)).rejects.toMatchObject({
        statusCode: 409,
        message: "A team with this name already exists in the company",
      });

      expect(teamRepository.create).not.toHaveBeenCalled();
    });

    it("allows creating a team with the same name in a different company", async () => {
      const input = { name: "Engineering", description: null };
      const created = makeTeam({ id: "team-2", companyId: "company-2" });

      vi.mocked(teamRepository.findByCompanyIdAndName).mockResolvedValue(undefined);
      vi.mocked(teamRepository.create).mockResolvedValue(created);

      const result = await teamService.createTeam("company-2", input);

      expect(result).toEqual(created);
      expect(teamRepository.findByCompanyIdAndName).toHaveBeenCalledWith("company-2", "Engineering");
    });
  });

  describe("listTeams", () => {
    it("returns only ACTIVE teams when includeArchived is false", async () => {
      const activeTeams = [makeTeam(), makeTeam({ id: "team-2", name: "Design" })];

      vi.mocked(teamRepository.findAllByCompanyId).mockResolvedValue(activeTeams);

      const result = await teamService.listTeams("company-1", false);

      expect(result).toEqual(activeTeams);
      expect(teamRepository.findAllByCompanyId).toHaveBeenCalledWith("company-1", false);
    });

    it("returns ACTIVE and ARCHIVED teams when includeArchived is true", async () => {
      const allTeams = [
        makeTeam(),
        makeTeam({ id: "team-2", name: "Old Team", status: "ARCHIVED" }),
      ];

      vi.mocked(teamRepository.findAllByCompanyId).mockResolvedValue(allTeams);

      const result = await teamService.listTeams("company-1", true);

      expect(result).toEqual(allTeams);
      expect(teamRepository.findAllByCompanyId).toHaveBeenCalledWith("company-1", true);
    });

    it("returns an empty array when no teams match", async () => {
      vi.mocked(teamRepository.findAllByCompanyId).mockResolvedValue([]);

      const result = await teamService.listTeams("company-1", false);

      expect(result).toEqual([]);
    });
  });

  describe("getTeam", () => {
    it("returns the team when it exists", async () => {
      const team = makeTeam();

      vi.mocked(teamRepository.findById).mockResolvedValue(team);

      const result = await teamService.getTeam("team-1");

      expect(result).toEqual(team);
      expect(teamRepository.findById).toHaveBeenCalledWith("team-1");
    });

    it("throws 404 when team does not exist", async () => {
      vi.mocked(teamRepository.findById).mockResolvedValue(undefined);

      await expect(teamService.getTeam("not-found")).rejects.toMatchObject({
        statusCode: 404,
        message: "Team not found",
      });
    });
  });

  describe("updateTeam", () => {
    it("updates and returns the team when it exists", async () => {
      const existing = makeTeam();
      const updated = makeTeam({ name: "Platform", updatedAt: new Date("2024-06-01") });

      vi.mocked(teamRepository.findById).mockResolvedValue(existing);
      vi.mocked(teamRepository.findByCompanyIdAndName).mockResolvedValue(undefined);
      vi.mocked(teamRepository.update).mockResolvedValue(updated);

      const result = await teamService.updateTeam("team-1", { name: "Platform" });

      expect(result).toEqual(updated);
      expect(teamRepository.update).toHaveBeenCalledWith("team-1", { name: "Platform" });
    });

    it("updates description without checking for name conflicts", async () => {
      const existing = makeTeam();
      const updated = makeTeam({ description: "New description" });

      vi.mocked(teamRepository.findById).mockResolvedValue(existing);
      vi.mocked(teamRepository.update).mockResolvedValue(updated);

      const result = await teamService.updateTeam("team-1", { description: "New description" });

      expect(result).toEqual(updated);
      expect(teamRepository.findByCompanyIdAndName).not.toHaveBeenCalled();
    });

    it("throws 404 when team does not exist", async () => {
      vi.mocked(teamRepository.findById).mockResolvedValue(undefined);

      await expect(teamService.updateTeam("not-found", { name: "Platform" })).rejects.toMatchObject({
        statusCode: 404,
        message: "Team not found",
      });

      expect(teamRepository.update).not.toHaveBeenCalled();
    });

    it("throws 409 when renaming to a name already taken by another team in the same company", async () => {
      const existing = makeTeam({ id: "team-1", name: "Engineering" });
      const conflicting = makeTeam({ id: "team-2", name: "Platform" });

      vi.mocked(teamRepository.findById).mockResolvedValue(existing);
      vi.mocked(teamRepository.findByCompanyIdAndName).mockResolvedValue(conflicting);

      await expect(teamService.updateTeam("team-1", { name: "Platform" })).rejects.toMatchObject({
        statusCode: 409,
        message: "Team name already exists in this company",
      });

      expect(teamRepository.update).not.toHaveBeenCalled();
    });

    it("does not throw 409 when renaming a team to its own current name", async () => {
      const existing = makeTeam({ id: "team-1", name: "Engineering" });
      const sameTeam = makeTeam({ id: "team-1", name: "Engineering" });
      const updated = makeTeam({ id: "team-1", name: "Engineering" });

      vi.mocked(teamRepository.findById).mockResolvedValue(existing);
      vi.mocked(teamRepository.findByCompanyIdAndName).mockResolvedValue(sameTeam);
      vi.mocked(teamRepository.update).mockResolvedValue(updated);

      const result = await teamService.updateTeam("team-1", { name: "Engineering" });

      expect(result).toEqual(updated);
      expect(teamRepository.update).toHaveBeenCalledWith("team-1", { name: "Engineering" });
    });
  });

  describe("archiveTeam", () => {
    it("archives an ACTIVE team successfully", async () => {
      const active = makeTeam({ status: "ACTIVE" });
      const archived = makeTeam({ status: "ARCHIVED", updatedAt: new Date("2024-06-01") });

      vi.mocked(teamRepository.findById).mockResolvedValue(active);
      vi.mocked(teamRepository.archive).mockResolvedValue(archived);

      const result = await teamService.archiveTeam("team-1");

      expect(result).toEqual(archived);
      expect(teamRepository.archive).toHaveBeenCalledWith("team-1");
    });

    it("throws 404 when team does not exist", async () => {
      vi.mocked(teamRepository.findById).mockResolvedValue(undefined);

      await expect(teamService.archiveTeam("not-found")).rejects.toMatchObject({
        statusCode: 404,
        message: "Team not found",
      });

      expect(teamRepository.archive).not.toHaveBeenCalled();
    });

    it("throws 409 when team is already ARCHIVED", async () => {
      const alreadyArchived = makeTeam({ status: "ARCHIVED" });

      vi.mocked(teamRepository.findById).mockResolvedValue(alreadyArchived);

      await expect(teamService.archiveTeam("team-1")).rejects.toMatchObject({
        statusCode: 409,
        message: "Team is already archived",
      });

      expect(teamRepository.archive).not.toHaveBeenCalled();
    });
  });
});
