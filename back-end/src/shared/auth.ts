import { FastifyRequest } from "fastify";

export const TEMP_AUTH_USER_ID = "00000000-0000-4000-8000-000000000001";

export function getAuthenticatedUserId(request: FastifyRequest): string {
  if (!request.user?.id) {
    throw { statusCode: 401, message: "Unauthorized" };
  }

  return request.user.id;
}
