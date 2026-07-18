import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import {
  acceptCandidateRecommendationHandler,
  createCandidateRecommendationHandler,
  createCandidateRecommendationsBatchHandler,
  getCandidateRecommendationHandler,
  listCandidateRecommendationsByPositionHandler,
  rejectCandidateRecommendationHandler,
  reviewLaterCandidateRecommendationHandler,
} from "./candidate-recommendation.handler";

export default fp(async (app: FastifyInstance) => {
  app.post("/candidate-recommendations", createCandidateRecommendationHandler);
  app.post(
    "/candidate-recommendations/batch",
    createCandidateRecommendationsBatchHandler,
  );
  app.get(
    "/positions/:positionId/recommendations",
    listCandidateRecommendationsByPositionHandler,
  );
  app.get("/candidate-recommendations/:id", getCandidateRecommendationHandler);
  app.post(
    "/candidate-recommendations/:id/accept",
    acceptCandidateRecommendationHandler,
  );
  app.post(
    "/candidate-recommendations/:id/reject",
    rejectCandidateRecommendationHandler,
  );
  app.post(
    "/candidate-recommendations/:id/review-later",
    reviewLaterCandidateRecommendationHandler,
  );
});
