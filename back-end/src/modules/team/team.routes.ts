import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import {
  createTeamHandler,
  listTeamsHandler,
  getTeamHandler,
  updateTeamHandler,
  archiveTeamHandler,
} from "./team.handler.js";

export default fp(async (app: FastifyInstance) => {
  app.get("/companies/:companyId/teams", listTeamsHandler);
  app.get("/teams/:id", getTeamHandler);
  app.post("/companies/:companyId/teams", createTeamHandler);
  app.put("/teams/:id", updateTeamHandler);
  app.patch("/teams/:id/archive", archiveTeamHandler);
});
