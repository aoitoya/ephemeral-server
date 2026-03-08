import { useAuthenticatedQuery } from "@/services/api-hooks";
import { userAPI } from "@/services/api/user.api";

export const useGetUsers = () => {
  return useAuthenticatedQuery(["users"], () => userAPI.getUsers(), {
    staleTime: 5 * 60 * 1000,
  });
};
