import { candidateProfileRepository } from "./candidate-profile.repository.js";
import type {
  CreateCandidateProfile,
  UpdateCurrentCandidateProfile,
} from "./candidate-profile.dto.js";

const profileNotFound = (): never => {
  throw { statusCode: 404, message: "Candidate profile not found" };
};

const userNotFound = (): never => {
  throw { statusCode: 404, message: "User not found" };
};

const candidateOnly = (): never => {
  throw {
    statusCode: 403,
    message: "Only users with type CANDIDATE can create a candidate profile",
  };
};

export const candidateProfileService = {
  createCurrentCandidateProfile: async (
    userId: string,
    data: CreateCandidateProfile,
  ) => {
    const user = await candidateProfileRepository.findUserById(userId);
    if (!user) return userNotFound();
    if (user.type !== "CANDIDATE") return candidateOnly();

    const existingProfile = await candidateProfileRepository.findByUserId(userId);
    if (existingProfile) {
      throw {
        statusCode: 409,
        message: "User already has a candidate profile",
      };
    }

    return candidateProfileRepository.create(userId, data);
  },

  getCurrentCandidateProfile: async (userId: string) => {
    const profile = await candidateProfileRepository.findByUserId(userId);
    if (!profile) return profileNotFound();
    return profile;
  },

  updateCurrentCandidateProfile: async (
    userId: string,
    data: UpdateCurrentCandidateProfile,
  ) => {
    const existingProfile = await candidateProfileRepository.findByUserId(userId);
    if (!existingProfile) return profileNotFound();

    const profile = await candidateProfileRepository.updateByUserId(userId, data);
    if (!profile) return profileNotFound();
    return profile;
  },

  listCandidateProfiles: async () => {
    return candidateProfileRepository.findActive();
  },

  getCandidateProfile: async (id: string) => {
    const profile = await candidateProfileRepository.findById(id);
    if (!profile) return profileNotFound();
    return profile;
  },

  deactivateCurrentCandidateProfile: async (userId: string) => {
    const existingProfile = await candidateProfileRepository.findByUserId(userId);
    if (!existingProfile) return profileNotFound();
    if (existingProfile.status === "DEACTIVATED") {
      throw {
        statusCode: 409,
        message: "Candidate profile is already deactivated",
      };
    }

    const profile = await candidateProfileRepository.deactivateByUserId(userId);
    if (!profile) return profileNotFound();
    return profile;
  },
};
