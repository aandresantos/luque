import Fastify from "fastify";
import cors from "@fastify/cors";
import companyRoutes from "modules/company/company.routes.js";
import positionRoutes from "modules/position/position.routes.js";
import teamRoutes from "modules/team/team.routes.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors);
  app.register(companyRoutes);
  app.register(positionRoutes);
  app.register(teamRoutes);

  return app;
}
