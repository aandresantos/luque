export type UserType = "CANDIDATE" | "COMPANY_USER";
export type UserStatus = "ACTIVE" | "DEACTIVATED";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  type: UserType;
  status: UserStatus;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
}
