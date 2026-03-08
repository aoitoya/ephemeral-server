import { apiClient } from "../api-client";

export interface User {
  id: string;
  username: string;
  isOnline?: boolean;
  unreadCount?: number;
}

export const userAPI = {
  getUsers: async (): Promise<{ id: string; username: string }[]> => {
    const response = await apiClient.get("/users");
    return response.data;
  },
  getMe: async (): Promise<User> => {
    const response = await apiClient.get("/users/me");
    return response.data;
  },
} as const;
