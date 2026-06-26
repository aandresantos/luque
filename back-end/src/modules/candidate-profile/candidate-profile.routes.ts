import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import {
  createCandidateProfileHandler,
  deactivateCurrentCandidateProfileHandler,
  getCandidateProfileHandler,
  getCurrentCandidateProfileHandler,
  listCandidateProfilesHandler,
  updateCurrentCandidateProfileHandler,
} from "./candidate-profile.handler";

export default fp(async (app: FastifyInstance) => {
  app.get("/candidate-profiles", listCandidateProfilesHandler);
  app.get("/candidate-profiles/me", getCurrentCandidateProfileHandler);
  app.get("/candidate-profiles/:id", getCandidateProfileHandler);
  app.post("/candidate-profiles", createCandidateProfileHandler);
  app.put("/candidate-profiles/me", updateCurrentCandidateProfileHandler);
  app.patch(
    "/candidate-profiles/me/deactivate",
    deactivateCurrentCandidateProfileHandler,
  );
});
