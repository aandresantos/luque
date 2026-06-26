import type { FastifyReply, FastifyRequest } from "fastify";
import { getAuthenticatedUserId } from "shared/auth";
import { isServiceError } from "shared/error";
import {
  CandidatePositionDecisionParamsDto,
  CandidatePositionParamsDto,
  PositionCandidatePositionsParamsDto,
  UpdateCandidatePositionStatusDto,
} from "./candidate-position.dto";
import { candidatePositionService } from "./candidate-position.service";

export const listCandidatePositionsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = PositionCandidatePositionsParamsDto.parse(request.params);
    const candidatePositions =
      await candidatePositionService.listCandidatePositionsByPosition(
        params.positionId,
      );
    return reply.code(200).send(candidatePositions);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const getCandidatePositionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = CandidatePositionParamsDto.parse(request.params);
    const candidatePosition =
      await candidatePositionService.getCandidatePosition(params.id);
    return reply.code(200).send(candidatePosition);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const selectCandidateForPositionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const params = CandidatePositionDecisionParamsDto.parse(request.params);
    const candidatePosition =
      await candidatePositionService.selectCandidateForPosition(
        params.positionId,
        params.candidateProfileId,
        userId,
      );
    return reply.code(200).send(candidatePosition);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const discardCandidateForPositionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const params = CandidatePositionDecisionParamsDto.parse(request.params);
    const candidatePosition =
      await candidatePositionService.discardCandidateForPosition(
        params.positionId,
        params.candidateProfileId,
        userId,
      );
    return reply.code(200).send(candidatePosition);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const updateCandidatePositionStatusHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const params = CandidatePositionParamsDto.parse(request.params);
    const body = UpdateCandidatePositionStatusDto.parse(request.body);
    const candidatePosition =
      await candidatePositionService.updateCandidatePositionStatus(
        params.id,
        body.status,
        userId,
      );
    return reply.code(200).send(candidatePosition);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};

export const getCandidatePositionHistoryHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = CandidatePositionParamsDto.parse(request.params);
    const history = await candidatePositionService.getCandidatePositionHistory(
      params.id,
    );
    return reply.code(200).send(history);
  } catch (err) {
    if (isServiceError(err)) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    throw err;
  }
};
