import { z } from "zod";
import { userStatusEnum, userTypeEnum } from "../user/user.schema";

const passwordRequirementMessage =
  "Password must be at least 8 characters long and include uppercase, lowercase, and numeric characters";

export const passwordSchema = z
  .string()
  .min(8, passwordRequirementMessage)
  .regex(/[A-Z]/, passwordRequirementMessage)
  .regex(/[a-z]/, passwordRequirementMessage)
  .regex(/[0-9]/, passwordRequirementMessage);

const emailSchema = z.email().max(255);

export const RegisterRequestDto = z.object({
  name: z.string().min(1).max(120),
  email: emailSchema,
  password: passwordSchema,
  type: z.enum(userTypeEnum.enumValues),
});

export type RegisterRequest = z.infer<typeof RegisterRequestDto>;

export const LoginRequestDto = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof LoginRequestDto>;

export const RefreshTokenRequestDto = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestDto>;

export const AuthenticatedUserDto = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string().email(),
  type: z.enum(userTypeEnum.enumValues),
  status: z.enum(userStatusEnum.enumValues),
});

export type AuthenticatedUser = z.infer<typeof AuthenticatedUserDto>;

export const AuthenticationResponseDto = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  user: AuthenticatedUserDto,
});

export type AuthenticationResponse = z.infer<typeof AuthenticationResponseDto>;
