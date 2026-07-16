import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../../shared/api/api-error";
import {
  clearAuthAccessToken,
  getCurrentUser,
  getAuthAccessToken,
} from "../api";
import type { AuthenticatedUser } from "../types";

export const currentUserQueryKey = ["auth", "current-user"] as const;

export function useCurrentUser() {
  const query = useQuery<AuthenticatedUser | null>({
    queryKey: currentUserQueryKey,
    queryFn: async () => {
      try {
        return await getCurrentUser();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearAuthAccessToken();
          return null;
        }

        throw error;
      }
    },
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }

      return failureCount < 1;
    },
  });

  const user = query.data ?? null;
  const isUnauthenticated =
    !query.isLoading && !query.isPending && user === null && !query.error;
  const hasAccessToken = Boolean(getAuthAccessToken());

  return {
    ...query,
    user,
    isAuthenticated: user !== null,
    isUnauthenticated,
    hasAccessToken,
  };
}
