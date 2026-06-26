import { z } from "zod";
import { userStatusEnum, userTypeEnum } from "./user.schema";

const userNameSchema = z.string().min(1).max(120);
const userEmailSchema = z.email().max(255);

export const CreateUserDto = z.object({
  name: userNameSchema,
  email: userEmailSchema,
  type: z.enum(userTypeEnum.enumValues),
});

export type CreateUser = z.infer<typeof CreateUserDto>;

export const UpdateCurrentUserDto = z
  .object({
    name: userNameSchema.optional(),
    email: userEmailSchema.optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: "At least one field (name or email) must be provided",
  });

export type UpdateCurrentUser = z.infer<typeof UpdateCurrentUserDto>;

export const UserResponseDto = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string().email(),
  type: z.enum(userTypeEnum.enumValues),
  status: z.enum(userStatusEnum.enumValues),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserResponse = z.infer<typeof UserResponseDto>;
