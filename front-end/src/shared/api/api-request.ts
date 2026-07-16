import { ApiError } from "./api-error";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = {
  [key: string]: JsonValue;
};

type ApiRequestBody = BodyInit | JsonObject | JsonValue[] | null | undefined;

type ApiRequestInit = Omit<RequestInit, "body"> & {
  body?: ApiRequestBody;
};

function isJsonBody(body: ApiRequestBody): body is JsonObject | JsonValue[] {
  if (body === null || body === undefined) {
    return false;
  }

  if (typeof body !== "object") {
    return false;
  }

  return !(
    body instanceof ArrayBuffer ||
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof ReadableStream
  );
}

function hasResponseBody(response: Response): boolean {
  if (response.status === 204 || response.status === 205) {
    return false;
  }

  const contentLength = response.headers.get("content-length");

  if (contentLength === "0") {
    return false;
  }

  return true;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (!hasResponseBody(response)) {
    return undefined;
  }

  const rawBody = await response.text();

  if (!rawBody) {
    return undefined;
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    return rawBody;
  }
}

function resolveErrorMessage(
  response: Response,
  details: unknown,
  fallbackMessage: string,
): string {
  if (
    typeof details === "object" &&
    details !== null &&
    "message" in details &&
    typeof details.message === "string" &&
    details.message.trim().length > 0
  ) {
    return details.message;
  }

  if (response.statusText) {
    return response.statusText;
  }

  return fallbackMessage;
}

export async function apiRequest<T>(
  path: string,
  init: ApiRequestInit = {},
): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_URL;

  if (!baseUrl) {
    throw new Error("VITE_API_URL is not defined");
  }

  const headers = new Headers(init.headers);
  const shouldSerializeJson = isJsonBody(init.body);
  const requestBody: BodyInit | null | undefined = shouldSerializeJson
    ? JSON.stringify(init.body)
    : (init.body as BodyInit | null | undefined);

  if (shouldSerializeJson && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(new URL(path, baseUrl), {
    ...init,
    body: requestBody,
    credentials: "include",
    headers,
  });

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(
      resolveErrorMessage(
        response,
        responseBody,
        `Request failed with status ${response.status}`,
      ),
      response.status,
      responseBody,
    );
  }

  return responseBody as T;
}

export type { ApiRequestInit, JsonObject, JsonValue };
