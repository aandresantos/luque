import type { FastifyReply, FastifyRequest } from "fastify";
import {
  CompanyMembershipCompanyParamsDto,
  CompanyMembershipParamsDto,
  CompanyMembershipUserParamsDto,
  CreateCompanyMembershipDto,
  ListCompanyMembershipsQueryDto,
  UpdateCompanyMembershipRoleDto,
} from "./company-membership.dto";
import { companyMembershipService } from "./company-membership.service";
import { getAuthenticatedUserId } from "shared/auth";

type ServiceError = { statusCode: number; message: string };

function isServiceError(err: unknown): err is ServiceError {
  return (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    "message" in err
  );
}

export const createCompanyMembershipHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const actorUserId = getAuthenticatedUserId(request);
    const params = CompanyMembershipCompanyParamsDto.parse(request.params);
    const body = CreateCompanyMembershipDto.parse(request.body);
    const membership = await companyMembershipService.createMembership(
      actorUserId,
      params.companyId,
      body,
    );

    return reply.code(201).send(membership);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }

    throw err;
  }
};

export const listCompanyMembershipsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = CompanyMembershipCompanyParamsDto.parse(request.params);
    const query = ListCompanyMembershipsQueryDto.parse(request.query);
    const includeInactive = query.includeInactive === "true";
    const memberships = await companyMembershipService.listMembershipsByCompany(
      params.companyId,
      includeInactive,
    );

    return reply.code(200).send(memberships);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }

    throw err;
  }
};

export const listUserCompanyMembershipsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = CompanyMembershipUserParamsDto.parse(request.params);
    const query = ListCompanyMembershipsQueryDto.parse(request.query);
    const includeInactive = query.includeInactive === "true";
    const memberships = await companyMembershipService.listMembershipsByUser(
      params.userId,
      includeInactive,
    );

    return reply.code(200).send(memberships);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }

    throw err;
  }
};

export const getCompanyMembershipHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = CompanyMembershipParamsDto.parse(request.params);
    const membership = await companyMembershipService.getMembership(params.id);
    return reply.code(200).send(membership);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }

    throw err;
  }
};

export const updateCompanyMembershipRoleHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const actorUserId = getAuthenticatedUserId(request);
    const params = CompanyMembershipParamsDto.parse(request.params);
    const body = UpdateCompanyMembershipRoleDto.parse(request.body);
    const membership = await companyMembershipService.updateMembershipRole(
      actorUserId,
      params.id,
      body,
    );

    return reply.code(200).send(membership);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }

    throw err;
  }
};

export const deactivateCompanyMembershipHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const actorUserId = getAuthenticatedUserId(request);
    const params = CompanyMembershipParamsDto.parse(request.params);
    const membership = await companyMembershipService.deactivateMembership(
      actorUserId,
      params.id,
    );

    return reply.code(200).send(membership);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }

    throw err;
  }
};
