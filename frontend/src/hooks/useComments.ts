import {
  useAuthenticatedMutation,
  useAuthenticatedQuery,
} from "@/services/api-hooks";
import { commentAPI, type Comment } from "@/services/api/post.api";
import { useQueryClient } from "@tanstack/react-query";

export const useCommentsFetcher = (
  params: {
    postId?: string;
    commentId?: string;
  },
  options?: { enabled?: boolean }
) => {
  const query = useAuthenticatedQuery(
    ["comments", params.postId || params.commentId],
    () => commentAPI.getComments(params),
    {
      enabled: options?.enabled ?? (!!params.postId || !!params.commentId),
    }
  );

  return { ...query, data: query.data || [] };
};

export const useCommentsVoter = () => {
  const queryClient = useQueryClient();

  return useAuthenticatedMutation(commentAPI.voteComment, {
    onMutate: async ({
      commentId,
      vote,
    }: {
      commentId: string;
      vote: "upvote" | "downvote";
    }) => {
      await queryClient.cancelQueries({ queryKey: ["comments"] });

      const previousQueries = queryClient.getQueriesData<Comment[]>({
        queryKey: ["comments"],
      });

      queryClient.setQueriesData<Comment[]>(
        { queryKey: ["comments"] },
        (old) => {
          if (!old) return [];
          return old.map((comment) => {
            if (comment.id === commentId) {
              const newComment = { ...comment };

              if (comment.userVote === vote) {
                if (vote === "upvote") newComment.upvotes -= 1;
                if (vote === "downvote") newComment.downvotes -= 1;
                newComment.userVote = null;
              } else {
                if (comment.userVote === "upvote") newComment.upvotes -= 1;
                if (comment.userVote === "downvote") newComment.downvotes -= 1;

                if (vote === "upvote") newComment.upvotes += 1;
                if (vote === "downvote") newComment.downvotes += 1;
                newComment.userVote = vote;
              }

              return newComment;
            }
            return comment;
          }
        )});

      return { previousQueries };
    },
    onError: (
      _err: unknown,
      _variables: { commentId: string; vote: "upvote" | "downvote" },
      context?: { previousQueries?: [readonly unknown[], Comment[] | undefined][] },
    ) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }
    },
  });
};

export const useCommentsCreator = () => {
  const queryClient = useQueryClient();

  const mutation = useAuthenticatedMutation(commentAPI.createComment, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  return mutation;
};
