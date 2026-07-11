/// <reference types="vitest/globals" />

import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import { hashPassword, verifyPassword } from "../../shared/password";
import { authRepository } from "./auth.repository";
import { authService } from "./auth.service";
import { userRepository } from "../user/user.repository";

vi.mock("../../db", () => ({
  db: {
    transaction: vi.fn(),
  },
}));

vi.mock("../../shared/password", async () => {
  const actual = await vi.importActual<typeof import("../../shared/password")>(
    "../../shared/password",
  );

  return {
    ...actual,
    hashPassword: vi.fn(),
    verifyPassword: vi.fn(),
  };
});

vi.mock("./auth.repository");
vi.mock("../user/user.repository");

const mockedDb = vi.mocked(db);

const makeUser = (
  overrides: Partial<Awaited<ReturnType<typeof userRepository.findById>>> = {},
) => ({
  id: "a7d80498-b2e3-47d0-b4b8-9cdb6e2d82a1",
  name: "Jane Doe",
  email: "jane@example.com",
  type: "CANDIDATE" as const,
  status: "ACTIVE" as const,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});

const makeSession = (
  overrides: Partial<Awaited<ReturnType<typeof authRepository.findActiveSessionById>>> = {},
) => ({
  id: "1f0dbd8f-83cf-48fc-9999-76d957678f95",
  userId: "a7d80498-b2e3-47d0-b4b8-9cdb6e2d82a1",
  refreshTokenHash: "refresh-hash",
  expiresAt: new Date(Date.now() + 60_000),
  revokedAt: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedDb.transaction.mockImplementation(async (callback) =>
      callback({} as never),
    );
  });

  describe("register", () => {
    it("creates user, credential, and session atomically", async () => {
      const user = makeUser();
      const session = makeSession();

      vi.mocked(userRepository.findByEmail).mockResolvedValue(undefined);
      vi.mocked(userRepository.create).mockResolvedValue(user);
      vi.mocked(authRepository.createCredential).mockResolvedValue({
        id: "credential-1",
        userId: user.id,
        provider: "PASSWORD",
        passwordHash: "hashed-password",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      });
      vi.mocked(authRepository.createSession).mockResolvedValue(session);
      vi.mocked(hashPassword).mockResolvedValue("hashed-password");

      const result = await authService.register({
        name: "Jane Doe",
        email: "JANE@EXAMPLE.COM",
        password: "Password1",
        type: "CANDIDATE",
      });

      expect(mockedDb.transaction).toHaveBeenCalled();
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        "jane@example.com",
        expect.anything(),
      );
      expect(userRepository.create).toHaveBeenCalledWith(
        {
          name: "Jane Doe",
          email: "jane@example.com",
          type: "CANDIDATE",
        },
        expect.anything(),
      );
      expect(authRepository.createCredential).toHaveBeenCalled();
      expect(authRepository.createSession).toHaveBeenCalled();
      expect(result.user.email).toBe("jane@example.com");
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    });

    it("throws 409 when email already exists", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser());
      vi.mocked(hashPassword).mockResolvedValue("hashed-password");

      await expect(
        authService.register({
          name: "Jane Doe",
          email: "jane@example.com",
          password: "Password1",
          type: "CANDIDATE",
        }),
      ).rejects.toMatchObject({
        statusCode: 409,
        message: "A user with this email already exists",
      });
    });
  });

  describe("login", () => {
    it("returns tokens when credentials are valid", async () => {
      const user = makeUser();
      const session = makeSession();

      vi.mocked(userRepository.findByEmail).mockResolvedValue(user);
      vi.mocked(authRepository.findCredentialByUserId).mockResolvedValue({
        id: "credential-1",
        userId: user.id,
        provider: "PASSWORD",
        passwordHash: "hashed-password",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      });
      vi.mocked(verifyPassword).mockResolvedValue(true);
      vi.mocked(authRepository.createSession).mockResolvedValue(session);

      const result = await authService.login({
        email: "jane@example.com",
        password: "Password1",
      });

      expect(result.user.id).toBe(user.id);
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    });

    it("returns generic error for deactivated users", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(
        makeUser({ status: "DEACTIVATED" }),
      );

      await expect(
        authService.login({
          email: "jane@example.com",
          password: "Password1",
        }),
      ).rejects.toMatchObject({
        statusCode: 401,
        message: "Invalid email or password",
      });
    });
  });

  describe("refresh", () => {
    it("rotates refresh token for active sessions", async () => {
      const session = makeSession();
      const user = makeUser();

      vi.mocked(authRepository.findSessionByRefreshTokenHash).mockResolvedValue(session);
      vi.mocked(userRepository.findById).mockResolvedValue(user);
      vi.mocked(authRepository.rotateSession).mockResolvedValue(session);

      const result = await authService.refresh({ refreshToken: "opaque-token" });

      expect(authRepository.rotateSession).toHaveBeenCalledWith(
        session.id,
        expect.objectContaining({
          refreshTokenHash: expect.any(String),
          expiresAt: expect.any(Date),
        }),
      );
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    });

    it("rejects revoked sessions", async () => {
      vi.mocked(authRepository.findSessionByRefreshTokenHash).mockResolvedValue(
        makeSession({ revokedAt: new Date("2024-06-01") }),
      );

      await expect(
        authService.refresh({ refreshToken: "opaque-token" }),
      ).rejects.toMatchObject({
        statusCode: 401,
        message: "Invalid refresh token",
      });
    });
  });

  describe("logout", () => {
    it("revokes the current session when it belongs to the user", async () => {
      vi.mocked(authRepository.findActiveSessionById).mockResolvedValue(makeSession());

      await authService.logout("a7d80498-b2e3-47d0-b4b8-9cdb6e2d82a1", "session-1");

      expect(authRepository.revokeSession).toHaveBeenCalledWith("session-1");
    });
  });
});
