import { positionRepository } from "./position.repository.js";
import type { CreatePosition, UpdatePosition } from "./position.dto.js";
import { PositionStatus } from "./position.schema.js";

const notFound = (): never => {
  throw { statusCode: 404, message: "Position not found" };
};

export const positionService = {
  createPosition: async (teamId: string, data: CreatePosition) => {
    return positionRepository.create(teamId, data);
  },

  listPositions: async (teamId: string, includesClosed: boolean) => {
    return positionRepository.findAllByTeamId(teamId, includesClosed);
  },

  getPosition: async (id: string) => {
    const position = await positionRepository.findById(id);
    if (!position) return notFound();
    return position;
  },

  updatePosition: async (id: string, data: UpdatePosition) => {
    const position = await positionRepository.update(id, data);
    if (!position) return notFound();
    return position;
  },

  updatePositionStatus: async (id: string, status: PositionStatus) => {
    const upperStatus = status.toUpperCase() as PositionStatus;
    const position = await positionRepository.updateStatus(id, upperStatus);
    if (!position) return notFound();
    return position;
  },
};
