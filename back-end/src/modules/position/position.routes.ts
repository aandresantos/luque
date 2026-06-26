import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import {
  createPositionHandler,
  listPositionsHandler,
  getPositionHandler,
  updatePositionHandler,
  updatePositionStatusHandler,
} from "./position.handler";

export default fp(async (app: FastifyInstance) => {
  app.get("/teams/:teamId/positions", listPositionsHandler);
  app.get("/positions/:id", getPositionHandler);
  app.post("/teams/:teamId/positions", createPositionHandler);
  app.put("/positions/:id", updatePositionHandler);
  app.patch("/positions/:id/status", updatePositionStatusHandler);
});
