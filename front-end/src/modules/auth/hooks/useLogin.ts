import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, setAuthAccessToken } from "../api";
import { currentUserQueryKey } from "./useCurrentUser";
import type { LoginInput } from "../types";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (response) => {
      setAuthAccessToken(response.accessToken);
      queryClient.setQueryData(currentUserQueryKey, response.user);
    },
  });
}
