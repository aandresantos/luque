import Fastify from "fastify";
import cors from "@fastify/cors";
import companyRoutes from "modules/company/company.routes.js";
import positionRoutes from "modules/position/position.routes.js";
import teamRoutes from "modules/team/team.routes.js";
import userRoutes from "modules/user/user.routes.js";
import devAuthPlugin from "./plugins/dev-auth.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors);
  app.register(devAuthPlugin);
  app.register(companyRoutes);
  app.register(positionRoutes);
  app.register(teamRoutes);
  app.register(userRoutes);

  return app;
}
