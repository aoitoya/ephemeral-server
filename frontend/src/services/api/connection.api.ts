import { apiClient } from "../api-client";

import { type User } from "./user.api";
export type { User } from "./user.api";

export interface Connection {
  id: string;
  createdAt: string;
  pending?: string;
  status?: string;
  user: User;
}

export const connectionAPI = {
  createConnectionRequest: async (data: { recipientId: string }) => {
    const response = await apiClient.post("/connections/request", data);
    return response.data;
  },

  acceptConnectionRequest: async (data: { requestId: string }) => {
    const response = await apiClient.post("/connections/response", {
      ...data,
      action: "accept",
    });
    return response.data;
  },

  rejectConnectionRequest: async (data: { requestId: string }) => {
    const response = await apiClient.post("/connections/response", {
      ...data,
      action: "reject",
    });
    return response.data;
  },

  getConnections: async (params?: {
    status?: "pending" | "active" | "blocked" | "cancelled" | "rejected";
  }): Promise<Connection[]> => {
    const response = await apiClient.get("/connections", { params });
    return response.data;
  },

  getOnlineConnections: async (): Promise<User[]> => {
    const response = await apiClient.get("/connections/online-connections");
    return response.data;
  },
} as const;
