import type { FastifyReply, FastifyRequest } from "fastify";
import {
  getAuthenticatedSessionId,
  getAuthenticatedUserId,
} from "shared/auth";
import { isServiceError } from "shared/error";
import {
  LoginRequestDto,
  RefreshTokenRequestDto,
  RegisterRequestDto,
} from "./auth.dto";
import { authService } from "./auth.service";

const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

function setRefreshTokenCookie(reply: FastifyReply, refreshToken: string): void {
  reply.setCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/auth",
  });
}

function clearRefreshTokenCookie(reply: FastifyReply): void {
  reply.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/auth",
  });
}

export const registerHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const body = RegisterRequestDto.parse(request.body);
    const response = await authService.register(body);
    setRefreshTokenCookie(reply, response.refreshToken);

    return reply.code(201).send(response);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }

    throw err;
  }
};

export const loginHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const body = LoginRequestDto.parse(request.body);
    const response = await authService.login(body);
    setRefreshTokenCookie(reply, response.refreshToken);

    return reply.code(200).send(response);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }

    throw err;
  }
};

export const refreshHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const rawRefreshToken =
      request.cookies.refreshToken ??
      (typeof request.body === "object" &&
      request.body !== null &&
      "refreshToken" in request.body
        ? request.body.refreshToken
        : undefined);
    const body = RefreshTokenRequestDto.parse({ refreshToken: rawRefreshToken });
    const response = await authService.refresh(body);
    setRefreshTokenCookie(reply, response.refreshToken);

    return reply.code(200).send(response);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }

    throw err;
  }
};

export const logoutHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const sessionId = getAuthenticatedSessionId(request);

    await authService.logout(userId, sessionId);
    clearRefreshTokenCookie(reply);

    return reply.code(204).send();
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }

    throw err;
  }
};

export const getCurrentUserHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const user = await authService.getCurrentUser(userId);

    return reply.code(200).send(user);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }

    throw err;
  }
};
