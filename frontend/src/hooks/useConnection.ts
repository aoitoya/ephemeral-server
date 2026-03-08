import {
  useAuthenticatedMutation,
  useAuthenticatedQuery,
} from "@/services/api-hooks";
import { connectionAPI, type Connection, type User } from "@/services/api/connection.api";

export type { Connection, User };

export const useConnectionRequest = () => {
  const mutation = useAuthenticatedMutation(
    connectionAPI.createConnectionRequest,
  );

  return mutation;
};

export const useConnectionAccept = () => {
  const mutation = useAuthenticatedMutation(
    connectionAPI.acceptConnectionRequest,
  );

  return mutation;
};

export const useConnectionReject = () => {
  const mutation = useAuthenticatedMutation(
    connectionAPI.rejectConnectionRequest,
  );

  return mutation;
};

export const useConnectionsFetch = (params?: {
  status?: "pending" | "active" | "blocked" | "cancelled" | "rejected";
}) => {
  return useAuthenticatedQuery<Connection[]>(["connections", params], () =>
    connectionAPI.getConnections(params),
  );
};

export const useOnlineConnectionsFetch = () => {
  return useAuthenticatedQuery<User[]>(["connections", "online"], () =>
    connectionAPI.getOnlineConnections(),
  );
};

export function useConnectionMutations() {
  const { mutateAsync: createConnectionRequest } = useConnectionRequest();
  const { mutateAsync: acceptConnectionRequest } = useConnectionAccept();
  const { mutateAsync: rejectConnectionRequest } = useConnectionReject();

  return {
    createConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
  };
}
