import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthenticatedMutation } from "@/services/api-hooks";
import { postAPI, type Post } from "@/services/api/post.api";

export interface CreatePost {
  content: string;
  topics: string[];
}

export interface Vote {
  postId: string;
  vote: "upvote" | "downvote";
}

export const usePosts = () => {
  const queryClient = useQueryClient();

  const {
    data: posts,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: postAPI.getPosts,
  });

  const createPostMutation = useAuthenticatedMutation<
    void,
    { content: string; file?: File }
  >(
    async ({ content, file }) => {
      const words = content.split(" ");
      const topics = words
        .filter((word: string) => word.startsWith("#"))
        .map((word: string) => word.slice(1));
      const cleanContent = words
        .filter((word: string) => !word.startsWith("#"))
        .join(" ");

      await postAPI.createPost({ content: cleanContent, topics }, file);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      },
    },
  );

  return {
    posts: posts || [],
    isLoading,
    refetch,
    error,
    createPost: createPostMutation.mutateAsync,
    isCreating: createPostMutation.isPending,
  };
};

export const useVotePost = () => {
  const queryClient = useQueryClient();

  return useAuthenticatedMutation(postAPI.votePost, {
    onMutate: async ({ postId, vote }: Vote) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousPosts = queryClient.getQueryData<Post[]>(["posts"]);

      queryClient.setQueryData<Post[]>(["posts"], (old) => {
        if (!old) return [];
        return old.map((post) => {
          if (post.id === postId) {
            const newPost = { ...post };

            if (post.userVote === vote) {
              if (vote === "upvote") newPost.upvotes -= 1;
              if (vote === "downvote") newPost.downvotes -= 1;
              newPost.userVote = null;
            } else {
              if (post.userVote === "upvote") newPost.upvotes -= 1;
              if (post.userVote === "downvote") newPost.downvotes -= 1;

              if (vote === "upvote") newPost.upvotes += 1;
              if (vote === "downvote") newPost.downvotes += 1;
              newPost.userVote = vote;
            }

            return newPost;
          }
          return post;
        });
      });

      return { previousPosts };
    },
    onError: (
      _err: unknown,
      _variables: Vote,
      context?: { previousPosts?: Post[] },
    ) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
    },
  });
};
