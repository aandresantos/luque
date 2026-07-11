import type { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import { verifyAccessToken } from "../shared/token";

function getBearerToken(request: FastifyRequest): string | null {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

export default fp(async (app: FastifyInstance) => {
  await app.register(cookie);
  await app.register(rateLimit, { global: false });

  app.addHook("preHandler", async (request: FastifyRequest) => {
    const token = getBearerToken(request);

    if (!token) {
      return;
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
      throw { statusCode: 401, message: "Unauthorized" };
    }

    request.user = {
      id: payload.sub,
      sessionId: payload.sessionId,
      type: payload.type,
    };
  });
});
