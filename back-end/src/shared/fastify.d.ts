import "fastify";
import type { UserType } from "../modules/user/user.schema";

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      id: string;
      sessionId: string;
      type: UserType;
    };
  }
}
