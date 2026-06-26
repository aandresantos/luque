import { teamRepository } from "./team.repository";
import type { CreateTeam, UpdateTeam } from "./team.dto";

const notFound = (): never => {
  throw { statusCode: 404, message: "Team not found" };
};

export const teamService = {
  createTeam: async (companyId: string, data: CreateTeam) => {
    const existing = await teamRepository.findByCompanyIdAndName(
      companyId,
      data.name,
    );
    if (existing) {
      throw { statusCode: 409, message: "A team with this name already exists in the company" };
    }
    return teamRepository.create(companyId, data);
  },

  listTeams: async (companyId: string, includeArchived: boolean) => {
    return teamRepository.findAllByCompanyId(companyId, includeArchived);
  },

  getTeam: async (id: string) => {
    const team = await teamRepository.findById(id);
    if (!team) return notFound();
    return team;
  },

  updateTeam: async (id: string, data: UpdateTeam) => {
    const existing = await teamRepository.findById(id);
    if (!existing) return notFound();

    if (data.name !== undefined) {
      const duplicate = await teamRepository.findByCompanyIdAndName(
        existing.companyId,
        data.name,
      );
      if (duplicate && duplicate.id !== id) {
        throw { statusCode: 409, message: "Team name already exists in this company" };
      }
    }

    const team = await teamRepository.update(id, data);
    if (!team) return notFound();
    return team;
  },

  archiveTeam: async (id: string) => {
    const team = await teamRepository.findById(id);
    if (!team) return notFound();
    if (team.status === "ARCHIVED") {
      throw { statusCode: 409, message: "Team is already archived" };
    }
    const archived = await teamRepository.archive(id);
    if (!archived) return notFound();
    return archived;
  },
};
