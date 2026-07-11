import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import {
  getCurrentUserHandler,
  loginHandler,
  logoutHandler,
  refreshHandler,
  registerHandler,
} from "./auth.handler";

const authRateLimit = {
  max: Number(process.env.AUTH_RATE_LIMIT_MAX ?? 5),
  timeWindow: process.env.AUTH_RATE_LIMIT_WINDOW ?? "1 minute",
};

export default fp(async (app: FastifyInstance) => {
  app.post("/auth/register", registerHandler);
  app.post("/auth/login", { config: { rateLimit: authRateLimit } }, loginHandler);
  app.post("/auth/refresh", { config: { rateLimit: authRateLimit } }, refreshHandler);
  app.post("/auth/logout", logoutHandler);
  app.get("/auth/me", getCurrentUserHandler);
});
