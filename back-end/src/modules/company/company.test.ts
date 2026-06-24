/// <reference types="vitest/globals" />

import { beforeEach, describe, expect, it, vi } from "vitest";
import { companyRepository } from "./company.repository.js";
import { companyService } from "./company.service.js";

vi.mock("./company.repository.js");

const makeCompany = (
  overrides: Partial<Awaited<ReturnType<typeof companyRepository.findById>>> = {},
) => ({
  id: "company-1",
  name: "Acme",
  slug: "acme",
  description: null,
  logoUrl: null,
  status: "ACTIVE" as const,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});

describe("companyService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("createCompany", () => {
    it("creates and returns a new company when no slug conflict exists", async () => {
      const input = {
        name: "Acme",
        slug: "acme",
        description: null,
        logoUrl: null,
      };
      const created = makeCompany();

      vi.mocked(companyRepository.findBySlug).mockResolvedValue(undefined);
      vi.mocked(companyRepository.create).mockResolvedValue(created);

      const result = await companyService.createCompany(input);

      expect(result).toEqual(created);
      expect(companyRepository.findBySlug).toHaveBeenCalledWith("acme");
      expect(companyRepository.create).toHaveBeenCalledWith(input);
    });

    it("throws 409 when a company with the same slug already exists", async () => {
      const input = {
        name: "Acme",
        slug: "acme",
        description: null,
        logoUrl: null,
      };

      vi.mocked(companyRepository.findBySlug).mockResolvedValue(makeCompany());

      await expect(companyService.createCompany(input)).rejects.toMatchObject({
        statusCode: 409,
        message: "A company with this slug already exists",
      });

      expect(companyRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("listCompanies", () => {
    it("returns only ACTIVE companies when includeArchived is false", async () => {
      const companies = [makeCompany(), makeCompany({ id: "company-2", slug: "globex" })];

      vi.mocked(companyRepository.findAll).mockResolvedValue(companies);

      const result = await companyService.listCompanies(false);

      expect(result).toEqual(companies);
      expect(companyRepository.findAll).toHaveBeenCalledWith(false);
    });

    it("returns ACTIVE and ARCHIVED companies when includeArchived is true", async () => {
      const companies = [
        makeCompany(),
        makeCompany({
          id: "company-2",
          slug: "globex",
          status: "ARCHIVED",
        }),
      ];

      vi.mocked(companyRepository.findAll).mockResolvedValue(companies);

      const result = await companyService.listCompanies(true);

      expect(result).toEqual(companies);
      expect(companyRepository.findAll).toHaveBeenCalledWith(true);
    });
  });

  describe("getCompany", () => {
    it("returns the company when it exists", async () => {
      const company = makeCompany();

      vi.mocked(companyRepository.findById).mockResolvedValue(company);

      const result = await companyService.getCompany("company-1");

      expect(result).toEqual(company);
      expect(companyRepository.findById).toHaveBeenCalledWith("company-1");
    });

    it("throws 404 when company does not exist", async () => {
      vi.mocked(companyRepository.findById).mockResolvedValue(undefined);

      await expect(companyService.getCompany("not-found")).rejects.toMatchObject({
        statusCode: 404,
        message: "Company not found",
      });
    });
  });

  describe("updateCompany", () => {
    it("updates and returns the company when it exists", async () => {
      const existing = makeCompany();
      const updated = makeCompany({ name: "Acme Labs", updatedAt: new Date("2024-06-01") });

      vi.mocked(companyRepository.findById).mockResolvedValue(existing);
      vi.mocked(companyRepository.findBySlug).mockResolvedValue(undefined);
      vi.mocked(companyRepository.update).mockResolvedValue(updated);

      const result = await companyService.updateCompany("company-1", {
        name: "Acme Labs",
        slug: "acme-labs",
      });

      expect(result).toEqual(updated);
      expect(companyRepository.findBySlug).toHaveBeenCalledWith("acme-labs");
      expect(companyRepository.update).toHaveBeenCalledWith("company-1", {
        name: "Acme Labs",
        slug: "acme-labs",
      });
    });

    it("updates non-slug fields without checking for slug conflicts", async () => {
      const existing = makeCompany();
      const updated = makeCompany({ description: "Updated description" });

      vi.mocked(companyRepository.findById).mockResolvedValue(existing);
      vi.mocked(companyRepository.update).mockResolvedValue(updated);

      const result = await companyService.updateCompany("company-1", {
        description: "Updated description",
      });

      expect(result).toEqual(updated);
      expect(companyRepository.findBySlug).not.toHaveBeenCalled();
    });

    it("throws 404 when company does not exist", async () => {
      vi.mocked(companyRepository.findById).mockResolvedValue(undefined);

      await expect(companyService.updateCompany("not-found", { name: "Acme Labs" })).rejects.toMatchObject({
        statusCode: 404,
        message: "Company not found",
      });

      expect(companyRepository.update).not.toHaveBeenCalled();
    });

    it("throws 409 when updating to a slug already taken by another company", async () => {
      const existing = makeCompany({ id: "company-1", slug: "acme" });
      const conflicting = makeCompany({ id: "company-2", slug: "globex" });

      vi.mocked(companyRepository.findById).mockResolvedValue(existing);
      vi.mocked(companyRepository.findBySlug).mockResolvedValue(conflicting);

      await expect(companyService.updateCompany("company-1", { slug: "globex" })).rejects.toMatchObject({
        statusCode: 409,
        message: "Company slug already exists",
      });

      expect(companyRepository.update).not.toHaveBeenCalled();
    });

    it("does not throw 409 when updating to its current slug", async () => {
      const existing = makeCompany({ id: "company-1", slug: "acme" });
      const sameCompany = makeCompany({ id: "company-1", slug: "acme" });
      const updated = makeCompany({ id: "company-1", slug: "acme" });

      vi.mocked(companyRepository.findById).mockResolvedValue(existing);
      vi.mocked(companyRepository.findBySlug).mockResolvedValue(sameCompany);
      vi.mocked(companyRepository.update).mockResolvedValue(updated);

      const result = await companyService.updateCompany("company-1", { slug: "acme" });

      expect(result).toEqual(updated);
      expect(companyRepository.update).toHaveBeenCalledWith("company-1", { slug: "acme" });
    });
  });

  describe("archiveCompany", () => {
    it("archives an ACTIVE company successfully", async () => {
      const active = makeCompany({ status: "ACTIVE" });
      const archived = makeCompany({ status: "ARCHIVED", updatedAt: new Date("2024-06-01") });

      vi.mocked(companyRepository.findById).mockResolvedValue(active);
      vi.mocked(companyRepository.archive).mockResolvedValue(archived);

      const result = await companyService.archiveCompany("company-1");

      expect(result).toEqual(archived);
      expect(companyRepository.archive).toHaveBeenCalledWith("company-1");
    });

    it("throws 404 when company does not exist", async () => {
      vi.mocked(companyRepository.findById).mockResolvedValue(undefined);

      await expect(companyService.archiveCompany("not-found")).rejects.toMatchObject({
        statusCode: 404,
        message: "Company not found",
      });

      expect(companyRepository.archive).not.toHaveBeenCalled();
    });

    it("throws 409 when company is already ARCHIVED", async () => {
      const archived = makeCompany({ status: "ARCHIVED" });

      vi.mocked(companyRepository.findById).mockResolvedValue(archived);

      await expect(companyService.archiveCompany("company-1")).rejects.toMatchObject({
        statusCode: 409,
        message: "Company is already archived",
      });

      expect(companyRepository.archive).not.toHaveBeenCalled();
    });
  });
});
