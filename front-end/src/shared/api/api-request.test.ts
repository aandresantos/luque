import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "./api-request";

const originalFetch = global.fetch;

function createJsonResponse(
  body: unknown,
  init?: ResponseInit & { headers?: HeadersInit },
) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    status: init?.status,
    statusText: init?.statusText,
  });
}

describe("apiRequest", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_URL", "http://localhost:3000");
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns parsed JSON on success", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      createJsonResponse({
        id: "company-1",
        name: "Luque",
      }),
    );

    const result = await apiRequest<{ id: string; name: string }>("/companies");

    expect(result).toEqual({
      id: "company-1",
      name: "Luque",
    });
  });

  it("returns undefined for 204 responses", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    );

    const result = await apiRequest<undefined>("/auth/logout", {
      method: "POST",
    });

    expect(result).toBeUndefined();
  });

  it("throws ApiError with JSON details", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      createJsonResponse(
        {
          message: "Invalid credentials",
          code: "AUTH_INVALID",
        },
        {
          status: 401,
          statusText: "Unauthorized",
        },
      ),
    );

    await expect(apiRequest("/auth/login")).rejects.toMatchObject({
      message: "Invalid credentials",
      status: 401,
      details: {
        message: "Invalid credentials",
        code: "AUTH_INVALID",
      },
    });
  });

  it("throws ApiError when the error response has no JSON body", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response("Gateway timeout", {
        status: 504,
        statusText: "Gateway Timeout",
        headers: {
          "Content-Type": "text/plain",
        },
      }),
    );

    await expect(apiRequest("/positions")).rejects.toMatchObject({
      message: "Gateway Timeout",
      status: 504,
      details: "Gateway timeout",
    });
  });

  it("always sends credentials with include", async () => {
    global.fetch = vi.fn().mockResolvedValue(createJsonResponse({ ok: true }));

    await apiRequest("/auth/me");

    expect(global.fetch).toHaveBeenCalledWith(
      new URL("/auth/me", "http://localhost:3000"),
      expect.objectContaining({
        credentials: "include",
      }),
    );
  });

  it("preserves incoming headers and only adds JSON content type when applicable", async () => {
    global.fetch = vi.fn().mockResolvedValue(createJsonResponse({ ok: true }));

    await apiRequest("/companies", {
      method: "POST",
      body: { name: "Luque" },
      headers: {
        "X-Trace-Id": "trace-123",
      },
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [, init] = vi.mocked(global.fetch).mock.calls[0];
    const headers = new Headers(init?.headers);

    expect(headers.get("X-Trace-Id")).toBe("trace-123");
    expect(headers.get("Content-Type")).toBe("application/json");
  });
});
