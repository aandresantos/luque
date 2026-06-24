import type { FastifyReply, FastifyRequest } from "fastify";
import { CreateUserDto, UpdateCurrentUserDto } from "./user.dto.js";
import { userService } from "./user.service.js";

type ServiceError = { statusCode: number; message: string };

function isServiceError(err: unknown): err is ServiceError {
  return (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    "message" in err
  );
}

function getAuthenticatedUserId(request: FastifyRequest): string {
  if (!request.user?.id) {
    throw { statusCode: 401, message: "Unauthorized" };
  }

  return request.user.id;
}

export const createUserHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const body = CreateUserDto.parse(request.body);
    const user = await userService.createUser(body);
    return reply.code(201).send(user);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const getCurrentUserHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const user = await userService.getCurrentUser(userId);
    return reply.code(200).send(user);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const updateCurrentUserHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const body = UpdateCurrentUserDto.parse(request.body);
    const user = await userService.updateCurrentUser(userId, body);
    return reply.code(200).send(user);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const deactivateCurrentUserHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const user = await userService.deactivateCurrentUser(userId);
    return reply.code(200).send(user);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};
