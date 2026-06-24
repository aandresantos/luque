import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import {
  createUserHandler,
  deactivateCurrentUserHandler,
  getCurrentUserHandler,
  updateCurrentUserHandler,
} from "./user.handler.js";

export default fp(async (app: FastifyInstance) => {
  app.post("/users", createUserHandler);
  app.get("/users/me", getCurrentUserHandler);
  app.put("/users/me", updateCurrentUserHandler);
  app.patch("/users/me/deactivate", deactivateCurrentUserHandler);
});
