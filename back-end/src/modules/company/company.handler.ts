import type { FastifyReply, FastifyRequest } from "fastify";
import { companyService } from "./company.service.js";
import {
  CompanyParamsDto,
  CreateCompanyDto,
  ListCompaniesQueryDto,
  UpdateCompanyDto,
} from "./company.dto.js";
import { getAuthenticatedUserId } from "shared/auth.js";

type ServiceError = { statusCode: number; message: string };

function isServiceError(err: unknown): err is ServiceError {
  return (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    "message" in err
  );
}

export const createCompanyHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const body = CreateCompanyDto.parse(request.body);
    const company = await companyService.createCompany(body, userId);
    return reply.code(201).send(company);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const listCompaniesHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const query = ListCompaniesQueryDto.parse(request.query);
    const includeArchived = query.includeArchived === "true";
    const companies = await companyService.listCompanies(includeArchived);
    return reply.code(200).send(companies);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const getCompanyHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = CompanyParamsDto.parse(request.params);
    const company = await companyService.getCompany(params.id);
    return reply.code(200).send(company);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const updateCompanyHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = CompanyParamsDto.parse(request.params);
    const body = UpdateCompanyDto.parse(request.body);
    const company = await companyService.updateCompany(params.id, body);
    return reply.code(200).send(company);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const archiveCompanyHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = CompanyParamsDto.parse(request.params);
    const company = await companyService.archiveCompany(params.id);
    return reply.code(200).send(company);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};
