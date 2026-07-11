import { createHash } from "node:crypto";
import { db } from "../../db";
import { isUniqueViolation } from "../../shared/error";
import { hashPassword, normalizeEmail, verifyPassword } from "../../shared/password";
import { issueAccessToken, issueRefreshToken } from "../../shared/token";
import { userRepository } from "../user/user.repository";
import type {
  AuthenticationResponse,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
} from "./auth.dto";
import { authRepository } from "./auth.repository";

const genericAuthError = {
  statusCode: 401,
  message: "Invalid email or password",
} as const;

const genericRefreshError = {
  statusCode: 401,
  message: "Invalid refresh token",
} as const;

function hashRefreshToken(refreshToken: string): string {
  return createHash("sha256").update(refreshToken).digest("hex");
}

function toAuthenticatedUser(user: {
  id: string;
  name: string;
  email: string;
  type: "CANDIDATE" | "COMPANY_USER";
  status: "ACTIVE" | "DEACTIVATED";
}): AuthenticationResponse["user"] {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    type: user.type,
    status: user.status,
  };
}

function issueSessionTokens(
  user: {
    id: string;
    type: "CANDIDATE" | "COMPANY_USER";
    name: string;
    email: string;
    status: "ACTIVE" | "DEACTIVATED";
  },
  sessionId: string,
  refreshToken: string,
): AuthenticationResponse {
  return {
    accessToken: issueAccessToken({
      sub: user.id,
      type: user.type,
      sessionId,
    }),
    refreshToken,
    user: toAuthenticatedUser(user),
  };
}

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthenticationResponse> => {
    const normalizedEmail = normalizeEmail(data.email);
    const passwordHash = await hashPassword(data.password);
    const refreshToken = issueRefreshToken();

    try {
      const result = await db.transaction(async (tx) => {
        const existingUser = await userRepository.findByEmail(normalizedEmail, tx);

        if (existingUser) {
          throw {
            statusCode: 409,
            message: "A user with this email already exists",
          };
        }

        const user = await userRepository.create(
          {
            name: data.name,
            email: normalizedEmail,
            type: data.type,
          },
          tx,
        );

        await authRepository.createCredential(
          {
            userId: user.id,
            passwordHash,
          },
          tx,
        );

        const session = await authRepository.createSession(
          {
            userId: user.id,
            refreshTokenHash: hashRefreshToken(refreshToken.token),
            expiresAt: refreshToken.expiresAt,
          },
          tx,
        );

        return { user, session };
      });

      return issueSessionTokens(result.user, result.session.id, refreshToken.token);
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "statusCode" in err &&
        "message" in err
      ) {
        throw err;
      }

      if (isUniqueViolation(err)) {
        throw {
          statusCode: 409,
          message: "A user with this email already exists",
        };
      }

      throw err;
    }
  },

  login: async (data: LoginRequest): Promise<AuthenticationResponse> => {
    const normalizedEmail = normalizeEmail(data.email);
    const user = await userRepository.findByEmail(normalizedEmail);

    if (!user || user.status !== "ACTIVE") {
      throw genericAuthError;
    }

    const credential = await authRepository.findCredentialByUserId(user.id);

    if (!credential) {
      throw genericAuthError;
    }

    const passwordMatches = await verifyPassword(data.password, credential.passwordHash);

    if (!passwordMatches) {
      throw genericAuthError;
    }

    const refreshToken = issueRefreshToken();
    const session = await authRepository.createSession({
      userId: user.id,
      refreshTokenHash: hashRefreshToken(refreshToken.token),
      expiresAt: refreshToken.expiresAt,
    });

    return issueSessionTokens(user, session.id, refreshToken.token);
  },

  refresh: async (
    data: RefreshTokenRequest,
  ): Promise<AuthenticationResponse> => {
    const session = await authRepository.findSessionByRefreshTokenHash(
      hashRefreshToken(data.refreshToken),
    );

    if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
      throw genericRefreshError;
    }

    const user = await userRepository.findById(session.userId);

    if (!user || user.status !== "ACTIVE") {
      throw genericRefreshError;
    }

    const newRefreshToken = issueRefreshToken();

    await authRepository.rotateSession(session.id, {
      refreshTokenHash: hashRefreshToken(newRefreshToken.token),
      expiresAt: newRefreshToken.expiresAt,
    });

    return issueSessionTokens(user, session.id, newRefreshToken.token);
  },

  logout: async (userId: string, sessionId: string): Promise<void> => {
    const session = await authRepository.findActiveSessionById(sessionId);

    if (!session || session.userId !== userId) {
      return;
    }

    await authRepository.revokeSession(sessionId);
  },

  getCurrentUser: async (userId: string) => {
    const user = await userRepository.findById(userId);

    if (!user || user.status !== "ACTIVE") {
      throw { statusCode: 401, message: "Unauthorized" };
    }

    return toAuthenticatedUser(user);
  },
};
