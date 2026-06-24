import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import {
  archiveCompanyHandler,
  createCompanyHandler,
  getCompanyHandler,
  listCompaniesHandler,
  updateCompanyHandler,
} from "./company.handler.js";

export default fp(async (app: FastifyInstance) => {
  app.get("/companies", listCompaniesHandler);
  app.get("/companies/:id", getCompanyHandler);
  app.post("/companies", createCompanyHandler);
  app.put("/companies/:id", updateCompanyHandler);
  app.patch("/companies/:id/archive", archiveCompanyHandler);
});
