import { userRepository } from "./user.repository.js";
import type { CreateUser, UpdateCurrentUser } from "./user.dto.js";

const notFound = (): never => {
  throw { statusCode: 404, message: "User not found" };
};

const deactivated = (): never => {
  throw { statusCode: 403, message: "User is deactivated" };
};

export const userService = {
  createUser: async (data: CreateUser) => {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw { statusCode: 409, message: "A user with this email already exists" };
    }

    return userRepository.create(data);
  },

  getCurrentUser: async (id: string) => {
    const user = await userRepository.findById(id);
    if (!user) return notFound();
    if (user.status === "DEACTIVATED") return deactivated();
    return user;
  },

  updateCurrentUser: async (id: string, data: UpdateCurrentUser) => {
    const existing = await userRepository.findById(id);
    if (!existing) return notFound();
    if (existing.status === "DEACTIVATED") return deactivated();

    if (data.email !== undefined) {
      const duplicate = await userRepository.findByEmail(data.email);
      if (duplicate && duplicate.id !== id) {
        throw { statusCode: 409, message: "User email already exists" };
      }
    }

    const user = await userRepository.update(id, data);
    if (!user) return notFound();
    return user;
  },

  deactivateCurrentUser: async (id: string) => {
    const existing = await userRepository.findById(id);
    if (!existing) return notFound();
    if (existing.status === "DEACTIVATED") {
      throw { statusCode: 409, message: "User is already deactivated" };
    }

    const user = await userRepository.deactivate(id);
    if (!user) return notFound();
    return user;
  },
};
