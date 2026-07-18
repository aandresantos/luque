import Fastify from "fastify";
import cors from "@fastify/cors";
import authRoutes from "modules/auth/auth.routes";
import candidateRecommendationRoutes from "modules/candidate-recommendation/candidate-recommendation.routes";
import candidatePositionRoutes from "modules/candidate-position/candidate-position.routes";
import candidateProfileRoutes from "modules/candidate-profile/candidate-profile.routes";
import companyMembershipRoutes from "modules/company-membership/company-membership.routes";
import companyRoutes from "modules/company/company.routes";
import positionRoutes from "modules/position/position.routes";
import teamRoutes from "modules/team/team.routes";
import userRoutes from "modules/user/user.routes";
import authPlugin from "./plugins/auth";

export function buildApp() {
  const app = Fastify({ logger: true });
  const allowedOrigins = new Set(["http://127.0.0.1:5173"]);

  app.register(cors, {
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed"), false);
    },
    credentials: true,
  });
  app.register(authPlugin);
  app.register(authRoutes);
  app.register(candidateRecommendationRoutes);
  app.register(candidatePositionRoutes);
  app.register(candidateProfileRoutes);
  app.register(companyMembershipRoutes);
  app.register(companyRoutes);
  app.register(positionRoutes);
  app.register(teamRoutes);
  app.register(userRoutes);

  return app;
}
