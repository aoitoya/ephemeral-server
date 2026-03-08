import { useState } from "react";
import {
  Box,
  Textarea,
  Button,
  Stack,
  Avatar,
  Divider,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/joy";
import {
  Send,
  Favorite as FavoriteIcon,
  HeartBroken,
} from "@mui/icons-material";
import type { Comment } from "@/services/api/post.api";
import {
  useCommentsCreator,
  useCommentsFetcher,
  useCommentsVoter,
} from "@/hooks/useComments";

interface CommentsSectionProps {
  postId: string;
  shouldLoadComments?: boolean;
}

interface CommentItemProps {
  comment: Comment;
  onVote?: (_params: { commentId: string; vote: "upvote" | "downvote" }) => void;
}

const CommentItem = ({ comment }: CommentItemProps) => {
  const { mutateAsync: handleVote } = useCommentsVoter();

  return (
    <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
      <Avatar size="sm" sx={{ mt: 0.5 }}>
        {comment.author?.username?.charAt(0).toUpperCase() || "A"}
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 0.5, gap: 1 }}>
          <Typography level="body-sm" fontWeight="bold">
            {comment.author?.username || "Anonymous"}
          </Typography>
          <Typography level="body-xs" color="neutral">
            {new Date(comment.createdAt).toLocaleString()}
          </Typography>
        </Box>
        <Typography level="body-sm" sx={{ mb: 1 }}>
          {comment.content}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            size="sm"
            variant="soft"
            color={comment.userVote === "upvote" ? "danger" : "neutral"}
            onClick={() =>
              handleVote({ commentId: comment.id, vote: "upvote" })
            }
          >
            <FavoriteIcon />
          </IconButton>
          <Typography
            level="body-xs"
            sx={{ minWidth: 20, textAlign: "center" }}
          >
            {comment.upvotes}
          </Typography>
          <IconButton
            size="sm"
            variant="soft"
            color={comment.userVote === "downvote" ? "primary" : "neutral"}
            onClick={() =>
              handleVote({ commentId: comment.id, vote: "downvote" })
            }
          >
            <HeartBroken />
          </IconButton>

          <Typography
            level="body-xs"
            sx={{ minWidth: 20, textAlign: "center" }}
          >
            {comment.downvotes}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export function CommentsSection({ postId }: CommentsSectionProps) {
  const { data: comments, isLoading } = useCommentsFetcher({ postId });
  const { mutateAsync: createComment } = useCommentsCreator();

  const [commentContent, setCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!commentContent.trim()) return;

    try {
      setIsSubmitting(true);
      await createComment({ postId, content: commentContent });
      setCommentContent("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
      {/* Add Comment */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Avatar size="sm" sx={{ mt: 0.5 }} />
          <Textarea
            placeholder="Write a comment..."
            minRows={1}
            maxRows={4}
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            sx={{ flexGrow: 1 }}
            endDecorator={
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                <Button
                  size="sm"
                  variant="soft"
                  color="primary"
                  onClick={handleAddComment}
                  loading={isSubmitting}
                  disabled={!commentContent.trim()}
                  startDecorator={<Send />}
                >
                  Post
                </Button>
              </Box>
            }
          />
        </Box>
        <Divider sx={{ my: 1 }} />
      </Box>

      {/* Comments List */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size="sm" />
        </Box>
      ) : comments.length > 0 ? (
        <Stack spacing={2}>
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </Stack>
      ) : (
        <Typography
          level="body-sm"
          color="neutral"
          sx={{ textAlign: "center", py: 2 }}
        >
          No comments yet. Be the first to comment!
        </Typography>
      )}
    </Box>
  );
}

export default CommentsSection;
