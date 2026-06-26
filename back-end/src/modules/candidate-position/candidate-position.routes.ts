import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import {
  discardCandidateForPositionHandler,
  getCandidatePositionHandler,
  getCandidatePositionHistoryHandler,
  listCandidatePositionsHandler,
  selectCandidateForPositionHandler,
  updateCandidatePositionStatusHandler,
} from "./candidate-position.handler";

export default fp(async (app: FastifyInstance) => {
  app.get(
    "/positions/:positionId/candidate-positions",
    listCandidatePositionsHandler,
  );
  app.get("/candidate-positions/:id", getCandidatePositionHandler);
  app.post(
    "/positions/:positionId/candidates/:candidateProfileId/select",
    selectCandidateForPositionHandler,
  );
  app.post(
    "/positions/:positionId/candidates/:candidateProfileId/discard",
    discardCandidateForPositionHandler,
  );
  app.patch(
    "/candidate-positions/:id/status",
    updateCandidatePositionStatusHandler,
  );
  app.get(
    "/candidate-positions/:id/history",
    getCandidatePositionHistoryHandler,
  );
});
