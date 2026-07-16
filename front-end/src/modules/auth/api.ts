import { apiRequest } from "../../shared/api/api-request";
import type {
  AuthenticatedUser,
  AuthenticationResponse,
  LoginInput,
} from "./types";

let accessToken: string | null = null;

function withAuthHeaders(headers?: HeadersInit): Headers {
  const nextHeaders = new Headers(headers);

  if (accessToken) {
    nextHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  return nextHeaders;
}

export function setAuthAccessToken(token: string | null) {
  accessToken = token;
}

export function clearAuthAccessToken() {
  accessToken = null;
}

export function getAuthAccessToken() {
  return accessToken;
}

export async function login(body: LoginInput): Promise<AuthenticationResponse> {
  return apiRequest<AuthenticationResponse>("/auth/login", {
    method: "POST",
    body: { ...body },
  });
}

export async function getCurrentUser(): Promise<AuthenticatedUser> {
  return apiRequest<AuthenticatedUser>("/auth/me", {
    headers: withAuthHeaders(),
  });
}

export async function logout(): Promise<void> {
  return apiRequest<void>("/auth/logout", {
    method: "POST",
    headers: withAuthHeaders(),
  });
}
