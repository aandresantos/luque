/// <reference types="vitest/globals" />

import { beforeEach, describe, expect, it, vi } from "vitest";
import { authRepository } from "../auth/auth.repository";
import { userRepository } from "./user.repository";
import { userService } from "./user.service";

vi.mock("./user.repository");
vi.mock("../auth/auth.repository");

const makeUser = (
  overrides: Partial<Awaited<ReturnType<typeof userRepository.findById>>> = {},
) => ({
  id: "user-1",
  name: "Jane Doe",
  email: "jane@example.com",
  type: "CANDIDATE" as const,
  status: "ACTIVE" as const,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});

describe("userService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("createUser", () => {
    it("creates and returns a new user when no email conflict exists", async () => {
      const input = {
        name: "Jane Doe",
        email: "jane@example.com",
        type: "CANDIDATE" as const,
      };
      const created = makeUser();

      vi.mocked(userRepository.findByEmail).mockResolvedValue(undefined);
      vi.mocked(userRepository.create).mockResolvedValue(created);

      const result = await userService.createUser(input);

      expect(result).toEqual(created);
      expect(userRepository.findByEmail).toHaveBeenCalledWith("jane@example.com");
      expect(userRepository.create).toHaveBeenCalledWith(input);
    });

    it("normalizes the email before checking uniqueness and persisting", async () => {
      const created = makeUser();

      vi.mocked(userRepository.findByEmail).mockResolvedValue(undefined);
      vi.mocked(userRepository.create).mockResolvedValue(created);

      await userService.createUser({
        name: "Jane Doe",
        email: "  JANE@EXAMPLE.COM ",
        type: "CANDIDATE",
      });

      expect(userRepository.findByEmail).toHaveBeenCalledWith("jane@example.com");
      expect(userRepository.create).toHaveBeenCalledWith({
        name: "Jane Doe",
        email: "jane@example.com",
        type: "CANDIDATE",
      });
    });

    it("throws 409 when a user with the same email already exists", async () => {
      const input = {
        name: "Jane Doe",
        email: "jane@example.com",
        type: "CANDIDATE" as const,
      };

      vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser());

      await expect(userService.createUser(input)).rejects.toMatchObject({
        statusCode: 409,
        message: "A user with this email already exists",
      });

      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("getCurrentUser", () => {
    it("returns the current user when it exists and is ACTIVE", async () => {
      const user = makeUser();

      vi.mocked(userRepository.findById).mockResolvedValue(user);

      const result = await userService.getCurrentUser("user-1");

      expect(result).toEqual(user);
      expect(userRepository.findById).toHaveBeenCalledWith("user-1");
    });

    it("throws 404 when the user does not exist", async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(undefined);

      await expect(userService.getCurrentUser("missing")).rejects.toMatchObject({
        statusCode: 404,
        message: "User not found",
      });
    });

    it("throws 403 when the user is DEACTIVATED", async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(
        makeUser({ status: "DEACTIVATED" }),
      );

      await expect(userService.getCurrentUser("user-1")).rejects.toMatchObject({
        statusCode: 403,
        message: "User is deactivated",
      });
    });
  });

  describe("updateCurrentUser", () => {
    it("updates and returns the current user when it exists", async () => {
      const existing = makeUser();
      const updated = makeUser({
        name: "Jane Smith",
        email: "jane.smith@example.com",
        updatedAt: new Date("2024-06-01"),
      });

      vi.mocked(userRepository.findById).mockResolvedValue(existing);
      vi.mocked(userRepository.findByEmail).mockResolvedValue(undefined);
      vi.mocked(userRepository.update).mockResolvedValue(updated);

      const result = await userService.updateCurrentUser("user-1", {
        name: "Jane Smith",
        email: "jane.smith@example.com",
      });

      expect(result).toEqual(updated);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        "jane.smith@example.com",
      );
      expect(userRepository.update).toHaveBeenCalledWith("user-1", {
        name: "Jane Smith",
        email: "jane.smith@example.com",
      });
    });

    it("updates non-email fields without checking for email conflicts", async () => {
      const existing = makeUser();
      const updated = makeUser({ name: "Jane Smith" });

      vi.mocked(userRepository.findById).mockResolvedValue(existing);
      vi.mocked(userRepository.update).mockResolvedValue(updated);

      const result = await userService.updateCurrentUser("user-1", {
        name: "Jane Smith",
      });

      expect(result).toEqual(updated);
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
    });

    it("throws 404 when the user does not exist", async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(undefined);

      await expect(
        userService.updateCurrentUser("missing", { name: "Jane Smith" }),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "User not found",
      });

      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("throws 403 when the user is DEACTIVATED", async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(
        makeUser({ status: "DEACTIVATED" }),
      );

      await expect(
        userService.updateCurrentUser("user-1", { name: "Jane Smith" }),
      ).rejects.toMatchObject({
        statusCode: 403,
        message: "User is deactivated",
      });

      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("throws 409 when updating to an email already used by another user", async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(makeUser());
      vi.mocked(userRepository.findByEmail).mockResolvedValue(
        makeUser({ id: "user-2", email: "other@example.com" }),
      );

      await expect(
        userService.updateCurrentUser("user-1", {
          email: "other@example.com",
        }),
      ).rejects.toMatchObject({
        statusCode: 409,
        message: "User email already exists",
      });

      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("does not throw 409 when updating to the current email", async () => {
      const existing = makeUser();
      const updated = makeUser();

      vi.mocked(userRepository.findById).mockResolvedValue(existing);
      vi.mocked(userRepository.findByEmail).mockResolvedValue(existing);
      vi.mocked(userRepository.update).mockResolvedValue(updated);

      const result = await userService.updateCurrentUser("user-1", {
        email: "JANE@EXAMPLE.COM",
      });

      expect(result).toEqual(updated);
      expect(userRepository.update).toHaveBeenCalledWith("user-1", {
        email: "jane@example.com",
      });
    });
  });

  describe("deactivateCurrentUser", () => {
    it("deactivates an ACTIVE user successfully", async () => {
      const active = makeUser({ status: "ACTIVE" });
      const deactivated = makeUser({
        status: "DEACTIVATED",
        updatedAt: new Date("2024-06-01"),
      });

      vi.mocked(userRepository.findById).mockResolvedValue(active);
      vi.mocked(userRepository.deactivate).mockResolvedValue(deactivated);

      const result = await userService.deactivateCurrentUser("user-1");

      expect(result).toEqual(deactivated);
      expect(userRepository.deactivate).toHaveBeenCalledWith("user-1");
      expect(authRepository.revokeSessionsByUserId).toHaveBeenCalledWith("user-1");
    });

    it("throws 404 when the user does not exist", async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(undefined);

      await expect(userService.deactivateCurrentUser("missing")).rejects.toMatchObject({
        statusCode: 404,
        message: "User not found",
      });

      expect(userRepository.deactivate).not.toHaveBeenCalled();
    });

    it("throws 409 when the user is already DEACTIVATED", async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(
        makeUser({ status: "DEACTIVATED" }),
      );

      await expect(userService.deactivateCurrentUser("user-1")).rejects.toMatchObject({
        statusCode: 409,
        message: "User is already deactivated",
      });

      expect(userRepository.deactivate).not.toHaveBeenCalled();
    });
  });
});
