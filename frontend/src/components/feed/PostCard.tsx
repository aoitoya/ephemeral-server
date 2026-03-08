import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Dropdown,
  MenuButton,
  Menu,
  MenuItem,
} from "@mui/joy";
import {
  Favorite,
  HeartBroken,
  ChatBubbleOutline,
  MoreVert,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";

import { CommentsSection } from "./CommentsSection";
import { ConnectionRequestDialog } from "@/components/messages/ConnectionRequestDialog";

import type { Post } from "@/services/api/post.api";
import { useConnectionMutations } from "@/hooks/useConnection";
import { useVotePost } from "@/hooks/usePosts";
import { API_V1 } from "@/services/api-client";
import { useCurrentUser } from "@/hooks/useAuth";

interface PostCardProps {
  post: Post;
  onCommentVote?: (_params: {
    commentId: string;
    vote: "upvote" | "downvote";
  }) => void;
  onAddComment?: (_postId: string, _content: string) => Promise<void>;
  comments?: import("@/services/api/post.api").Comment[];
  isLoadingComments?: boolean;
}

export function PostCard({ post }: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false);
  const { mutateAsync: votePost, isPending: isVoting } = useVotePost();
  const connection = useConnectionMutations();
  const { data: currentUser } = useCurrentUser();

  const isOwnPost = currentUser?.id === post.author?.id;

  const handleSendConnectionRequest = async () => {
    await connection.createConnectionRequest({
      recipientId: post.author?.id,
    });
  };

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          mb: 2,
          transition: "all 0.2s ease",
          "&:hover": {
            boxShadow: "md",
            borderColor: "divider",
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Avatar
              size="md"
              sx={{
                bgcolor: "primary.solidBg",
                fontSize: "1rem",
              }}
            >
              {post.author?.username?.charAt(0).toUpperCase() || "A"}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: " center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    level="title-sm"
                    sx={{ fontWeight: 600, display: "inline-block", mr: 1 }}
                  >
                    {post.author?.username || "Anonymous"}
                  </Typography>
                  <Typography
                    level="body-xs"
                    color="neutral"
                    sx={{ display: "inline-block" }}
                  >
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </Typography>
                </Box>
                {currentUser && !isOwnPost && (
                  <Dropdown>
                    <MenuButton size="sm" variant="plain">
                      <MoreVert fontSize="small" />
                    </MenuButton>
                    <Menu size="sm" variant="plain">
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsConnectionDialogOpen(true);
                        }}
                      >
                        Send Connection Request
                      </MenuItem>
                    </Menu>
                  </Dropdown>
                )}
              </Box>

              <Typography
                sx={{
                  mt: 1.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {post.content}
              </Typography>

              {post.mediaKey && (
                <Box
                  sx={{
                    mt: 2,
                    borderRadius: "lg",
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box
                    component="img"
                    src={`${API_V1}/media/${post.mediaKey}`}
                    alt="Post attachment"
                    sx={{
                      width: "100%",
                      maxHeight: "400px",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </Box>
              )}

              {post.topics && post.topics.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    mt: 2,
                  }}
                >
                  {post.topics.map((topic) => (
                    <Typography
                      key={topic}
                      level="body-xs"
                      sx={{
                        color: "primary",
                        fontWeight: 500,
                        cursor: "pointer",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      #{topic}
                    </Typography>
                  ))}
                </Box>
              )}

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 2,
                  pt: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Button
                  size="sm"
                  variant="plain"
                  color={post.userVote === "upvote" ? "danger" : "neutral"}
                  onClick={() => votePost({ postId: post.id, vote: "upvote" })}
                  disabled={isVoting}
                  startDecorator={
                    post.userVote === "upvote" ? (
                      <Favorite sx={{ fontSize: 16 }} />
                    ) : (
                      <Favorite sx={{ fontSize: 16 }} />
                    )
                  }
                  sx={{
                    borderRadius: "20px",
                    px: 2,
                    "&:hover": {
                      bgcolor:
                        post.userVote === "upvote"
                          ? "rgba(244, 67, 54, 0.1)"
                          : "action.hover",
                    },
                  }}
                >
                  {post.upvotes}
                </Button>

                <Button
                  size="sm"
                  variant="plain"
                  color={post.userVote === "downvote" ? "primary" : "neutral"}
                  onClick={() =>
                    votePost({ postId: post.id, vote: "downvote" })
                  }
                  disabled={isVoting}
                  startDecorator={<HeartBroken sx={{ fontSize: 16 }} />}
                  sx={{
                    borderRadius: "20px",
                    px: 2,
                    "&:hover": {
                      bgcolor:
                        post.userVote === "downvote"
                          ? "rgba(102, 126, 234, 0.1)"
                          : "action.hover",
                    },
                  }}
                >
                  {post.downvotes}
                </Button>

                <Button
                  size="sm"
                  variant="plain"
                  color={isExpanded ? "primary" : "neutral"}
                  onClick={() => setIsExpanded(!isExpanded)}
                  startDecorator={<ChatBubbleOutline sx={{ fontSize: 16 }} />}
                  sx={{
                    borderRadius: "20px",
                    px: 2,
                    ml: "auto",
                    "&:hover": {
                      bgcolor: isExpanded
                        ? "rgba(102, 126, 234, 0.1)"
                        : "action.hover",
                    },
                  }}
                >
                  {post.commentCount || 0}
                </Button>
              </Box>

              {isExpanded && (
                <Box sx={{ mt: 2 }}>
                  <CommentsSection postId={post.id} />
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <ConnectionRequestDialog
        open={isConnectionDialogOpen}
        onClose={() => setIsConnectionDialogOpen(false)}
        recipientUsername={post.author?.username || "this user"}
        onSubmit={handleSendConnectionRequest}
      />
    </>
  );
}

export default PostCard;
