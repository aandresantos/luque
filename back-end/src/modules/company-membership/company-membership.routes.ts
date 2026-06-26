import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import {
  createCompanyMembershipHandler,
  deactivateCompanyMembershipHandler,
  getCompanyMembershipHandler,
  listCompanyMembershipsHandler,
  listUserCompanyMembershipsHandler,
  updateCompanyMembershipRoleHandler,
} from "./company-membership.handler";

export default fp(async (app: FastifyInstance) => {
  app.get("/companies/:companyId/memberships", listCompanyMembershipsHandler);
  app.get(
    "/users/:userId/company-memberships",
    listUserCompanyMembershipsHandler,
  );
  app.get("/company-memberships/:id", getCompanyMembershipHandler);
  app.post("/companies/:companyId/memberships", createCompanyMembershipHandler);
  app.patch(
    "/company-memberships/:id/role",
    updateCompanyMembershipRoleHandler,
  );
  app.patch(
    "/company-memberships/:id/deactivate",
    deactivateCompanyMembershipHandler,
  );
});
