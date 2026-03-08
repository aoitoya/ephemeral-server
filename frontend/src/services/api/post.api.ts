import { apiClient } from "@/services/api-client";

interface User {
  id: string;
  username: string;
}

export interface Post {
  id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  topics: string[];
  mediaKey: string | null;
  createdAt: string;
  commentCount: number;
  userVote: "upvote" | "downvote" | null;
  author: User;
}

export interface Comment {
  postId?: string;
  commentId?: string;
  id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  userVote: "upvote" | "downvote" | null;
  author: User;
}

export const postAPI = {
  createPost: async (
    data: { content: string; topics: string[] },
    file?: File,
  ) => {
    if (file) {
      const formData = new FormData();
      formData.append("content", data.content);
      formData.append("topics", JSON.stringify(data.topics));
      formData.append("file", file);
      const response = await apiClient.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    }
    const response = await apiClient.post("/posts", data);
    return response.data;
  },
  getPosts: async (): Promise<Post[]> => {
    const response = await apiClient.get("/posts");
    return response.data;
  },
  votePost: async ({
    postId,
    vote,
  }: {
    postId: string;
    vote: "upvote" | "downvote";
  }) => {
    const response = await apiClient.post(`/posts/vote`, {
      postId,
      type: vote,
    });
    return response.data;
  },
} as const;

export const commentAPI = {
  createComment: async (params: {
    postId?: string;
    commentId?: string;
    content: string;
  }) => {
    const response = await apiClient.post(`/posts/comments`, params);
    return response.data;
  },

  getComments: async (params: {
    postId?: string;
    commentId?: string;
  }): Promise<Comment[]> => {
    const response = await apiClient.get(`/posts/comments`, {
      params,
    });
    return response.data;
  },

  voteComment: async ({
    commentId,
    vote,
  }: {
    commentId: string;
    vote: "upvote" | "downvote";
  }) => {
    const response = await apiClient.post(`/posts/vote`, {
      commentId,
      type: vote,
    });
    return response.data;
  },
} as const;
