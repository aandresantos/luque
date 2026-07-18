import type { FastifyReply, FastifyRequest } from "fastify";
import { getAuthenticatedUserId } from "shared/auth";
import { isServiceError } from "shared/error";
import {
  CandidateRecommendationParamsDto,
  CreateCandidateRecommendationDto,
  CreateCandidateRecommendationsBatchDto,
  ListCandidateRecommendationsQueryDto,
  PositionRecommendationParamsDto,
} from "./candidate-recommendation.dto";
import { isCandidateRecommendationServiceError } from "./candidate-recommendation.errors";
import { candidateRecommendationService } from "./candidate-recommendation.service";

const sendError = (reply: FastifyReply, err: unknown) => {
  if (isCandidateRecommendationServiceError(err)) {
    return reply
      .code(err.statusCode)
      .send({ code: err.code, message: err.message });
  }

  if (isServiceError(err)) {
    return reply.code(err.statusCode).send({ message: err.message });
  }

  throw err;
};

export const createCandidateRecommendationHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const body = CreateCandidateRecommendationDto.parse(request.body);
    const recommendation =
      await candidateRecommendationService.createRecommendation(body, userId);
    return reply.code(201).send(recommendation);
  } catch (err) {
    return sendError(reply, err);
  }
};

export const createCandidateRecommendationsBatchHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const body = CreateCandidateRecommendationsBatchDto.parse(request.body);
    const result =
      await candidateRecommendationService.createRecommendationsBatch(
        body,
        userId,
      );
    return reply.code(201).send(result);
  } catch (err) {
    return sendError(reply, err);
  }
};

export const listCandidateRecommendationsByPositionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const params = PositionRecommendationParamsDto.parse(request.params);
    const query = ListCandidateRecommendationsQueryDto.parse(request.query);
    const result =
      await candidateRecommendationService.listRecommendationsByPosition(
        params.positionId,
        query,
        userId,
      );
    return reply.code(200).send(result);
  } catch (err) {
    return sendError(reply, err);
  }
};

export const getCandidateRecommendationHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const params = CandidateRecommendationParamsDto.parse(request.params);
    const recommendation = await candidateRecommendationService.getRecommendation(
      params.id,
      userId,
    );
    return reply.code(200).send(recommendation);
  } catch (err) {
    return sendError(reply, err);
  }
};

export const acceptCandidateRecommendationHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const params = CandidateRecommendationParamsDto.parse(request.params);
    const result = await candidateRecommendationService.acceptRecommendation(
      params.id,
      userId,
    );
    return reply.code(200).send(result);
  } catch (err) {
    return sendError(reply, err);
  }
};

export const rejectCandidateRecommendationHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const params = CandidateRecommendationParamsDto.parse(request.params);
    const recommendation =
      await candidateRecommendationService.rejectRecommendation(
        params.id,
        userId,
      );
    return reply.code(200).send(recommendation);
  } catch (err) {
    return sendError(reply, err);
  }
};

export const reviewLaterCandidateRecommendationHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const params = CandidateRecommendationParamsDto.parse(request.params);
    const recommendation =
      await candidateRecommendationService.reviewLaterRecommendation(
        params.id,
        userId,
      );
    return reply.code(200).send(recommendation);
  } catch (err) {
    return sendError(reply, err);
  }
};
