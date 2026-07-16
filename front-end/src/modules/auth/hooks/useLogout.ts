import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { clearAuthAccessToken, logout } from "../api";
import { currentUserQueryKey } from "./useCurrentUser";

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSettled: async () => {
      clearAuthAccessToken();
      queryClient.setQueryData(currentUserQueryKey, null);
      await queryClient.cancelQueries({ queryKey: currentUserQueryKey });
      navigate("/login", { replace: true });
    },
  });
}
