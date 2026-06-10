import Fastify from "fastify";
import cors from "@fastify/cors";
import positionRoutes from "modules/position/position.routes.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors);
  app.register(positionRoutes);

  return app;
}
