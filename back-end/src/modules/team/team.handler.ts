import type { FastifyRequest, FastifyReply } from "fastify";
import { teamService } from "./team.service.js";
import {
  CreateTeamDto,
  UpdateTeamDto,
  TeamParamsDto,
  CompanyTeamsParamsDto,
  ListTeamsQueryDto,
} from "./team.dto.js";

type ServiceError = { statusCode: number; message: string };

function isServiceError(err: unknown): err is ServiceError {
  return (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    "message" in err
  );
}

export const createTeamHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = CompanyTeamsParamsDto.parse(request.params);
    const body = CreateTeamDto.parse(request.body);
    const team = await teamService.createTeam(params.companyId, body);
    return reply.code(201).send(team);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const listTeamsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = CompanyTeamsParamsDto.parse(request.params);
    const query = ListTeamsQueryDto.parse(request.query);
    const includeArchived = query.includeArchived === "true";
    const teams = await teamService.listTeams(params.companyId, includeArchived);
    return reply.code(200).send(teams);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const getTeamHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = TeamParamsDto.parse(request.params);
    const team = await teamService.getTeam(params.id);
    return reply.code(200).send(team);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const updateTeamHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = TeamParamsDto.parse(request.params);
    const body = UpdateTeamDto.parse(request.body);
    const team = await teamService.updateTeam(params.id, body);
    return reply.code(200).send(team);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const archiveTeamHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = TeamParamsDto.parse(request.params);
    const team = await teamService.archiveTeam(params.id);
    return reply.code(200).send(team);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};
