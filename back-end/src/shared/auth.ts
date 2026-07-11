import type { FastifyRequest } from "fastify";
import type { UserType } from "modules/user";

export type AuthenticatedRequestUser = {
  id: string;
  sessionId: string;
  type: UserType;
};

export function getAuthenticatedUserId(request: FastifyRequest): string {
  if (!request.user?.id) {
    throw { statusCode: 401, message: "Unauthorized" };
  }

  return request.user.id;
}

export function getAuthenticatedSessionId(request: FastifyRequest): string {
  if (!request.user?.sessionId) {
    throw { statusCode: 401, message: "Unauthorized" };
  }

  return request.user.sessionId;
}

export function getAuthenticatedUser(request: FastifyRequest): AuthenticatedRequestUser {
  if (!request.user?.id || !request.user.sessionId || !request.user.type) {
    throw { statusCode: 401, message: "Unauthorized" };
  }

  return request.user;
}
