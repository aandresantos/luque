import type { FastifyReply, FastifyRequest } from "fastify";
import { getAuthenticatedUserId } from "../../shared/auth.js";
import {
  CandidateProfileParamsDto,
  CreateCandidateProfileDto,
  UpdateCurrentCandidateProfileDto,
} from "./candidate-profile.dto.js";
import { candidateProfileService } from "./candidate-profile.service.js";

type ServiceError = { statusCode: number; message: string };

function isServiceError(err: unknown): err is ServiceError {
  return (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    "message" in err
  );
}

export const createCandidateProfileHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const body = CreateCandidateProfileDto.parse(request.body);
    const profile = await candidateProfileService.createCurrentCandidateProfile(
      userId,
      body,
    );
    return reply.code(201).send(profile);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const getCurrentCandidateProfileHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const profile = await candidateProfileService.getCurrentCandidateProfile(
      userId,
    );
    return reply.code(200).send(profile);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const updateCurrentCandidateProfileHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const body = UpdateCurrentCandidateProfileDto.parse(request.body);
    const profile = await candidateProfileService.updateCurrentCandidateProfile(
      userId,
      body,
    );
    return reply.code(200).send(profile);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const listCandidateProfilesHandler = async (
  _request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const profiles = await candidateProfileService.listCandidateProfiles();
    return reply.code(200).send(profiles);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const getCandidateProfileHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = CandidateProfileParamsDto.parse(request.params);
    const profile = await candidateProfileService.getCandidateProfile(params.id);
    return reply.code(200).send(profile);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const deactivateCurrentCandidateProfileHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const profile = await candidateProfileService.deactivateCurrentCandidateProfile(
      userId,
    );
    return reply.code(200).send(profile);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};
