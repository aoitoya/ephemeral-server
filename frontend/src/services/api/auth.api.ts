import { apiClient } from "../api-client";

export const authAPI = {
  register: async (credentials: { username: string; password: string }) => {
    const response = await apiClient.post("/users/register", credentials);
    return response.data;
  },

  login: async (credentials: { username: string; password: string }) => {
    const response = await apiClient.post("/users/login", credentials);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post("/users/logout");
    return response.data;
  },
} as const;
