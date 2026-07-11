import Fastify from "fastify";
import cors from "@fastify/cors";
import authRoutes from "modules/auth/auth.routes";
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

  app.register(cors);
  app.register(authPlugin);
  app.register(authRoutes);
  app.register(candidatePositionRoutes);
  app.register(candidateProfileRoutes);
  app.register(companyMembershipRoutes);
  app.register(companyRoutes);
  app.register(positionRoutes);
  app.register(teamRoutes);
  app.register(userRoutes);

  return app;
}
