import fp from "fastify-plugin";
import type { FastifyInstance, FastifyRequest } from "fastify";

const TEMP_AUTH_USER_ID =
  process.env.TEMP_AUTH_USER_ID ?? "00000000-0000-4000-8000-000000000001";
const TEMP_AUTH_SESSION_ID =
  process.env.TEMP_AUTH_SESSION_ID ?? "dev-session";

export default fp(async (app: FastifyInstance) => {
  app.addHook("preHandler", async (request: FastifyRequest) => {
    request.user = {
      id: TEMP_AUTH_USER_ID,
      sessionId: TEMP_AUTH_SESSION_ID,
      type: "COMPANY_USER",
    };
  });
});
