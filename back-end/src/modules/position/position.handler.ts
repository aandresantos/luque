import type { FastifyRequest, FastifyReply } from "fastify";
import { positionService } from "./position.service.js";
import {
  CreatePositionDto,
  UpdatePositionDto,
  UpdatePositionStatusDto,
  PositionParamsDto,
  TeamPositionsParamsDto,
  ListPositionsQueryDto,
} from "./position.dto.js";

type ServiceError = { statusCode: number; message: string };

function isServiceError(err: unknown): err is ServiceError {
  return (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    "message" in err
  );
}

export const createPositionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = TeamPositionsParamsDto.parse(request.params);
    const body = CreatePositionDto.parse(request.body);
    const position = await positionService.createPosition(params.teamId, body);
    return reply.code(201).send(position);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const listPositionsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = TeamPositionsParamsDto.parse(request.params);
    const query = ListPositionsQueryDto.parse(request.query);
    const includesClosed = query.includesClosed === "true";
    const positions = await positionService.listPositions(
      params.teamId,
      includesClosed,
    );
    return reply.code(200).send(positions);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const getPositionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = PositionParamsDto.parse(request.params);
    const position = await positionService.getPosition(params.id);
    return reply.code(200).send(position);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const updatePositionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = PositionParamsDto.parse(request.params);
    const body = UpdatePositionDto.parse(request.body);
    const position = await positionService.updatePosition(params.id, body);
    return reply.code(200).send(position);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const updatePositionStatusHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = PositionParamsDto.parse(request.params);
    const body = UpdatePositionStatusDto.parse(request.body);
    const position = await positionService.updatePositionStatus(
      params.id,
      body.status,
    );
    return reply.code(200).send(position);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};
