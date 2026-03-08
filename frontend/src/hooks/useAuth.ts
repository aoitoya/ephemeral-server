import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "@/services/api/auth.api";
import { userAPI } from "@/services/api/user.api";
import type { User } from "@/services/api/user.api";
import { isLoggedIn } from "@/services/utils";

export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      localStorage.setItem("logged_in", "true");
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authKeys.all });
      localStorage.setItem("logged_in", "true");
    },
  });
};

export const useCurrentUser = () => {
  return useQuery<User>({
    enabled: isLoggedIn(),
    queryKey: authKeys.user(),
    queryFn: () => userAPI.getMe(),
    retry: (failureCount, error: unknown) => {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 401) return false;
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000,
  });
};
