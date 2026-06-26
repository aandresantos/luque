import fp from "fastify-plugin";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { TEMP_AUTH_USER_ID } from "../shared/auth";

export default fp(async (app: FastifyInstance) => {
  app.addHook("preHandler", async (request: FastifyRequest) => {
    request.user = { id: TEMP_AUTH_USER_ID };
  });
});
