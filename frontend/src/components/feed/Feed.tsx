import {
  Box,
  Typography,
  CircularProgress,
  Button,
} from "@mui/joy";
import { Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { PostCard } from "./PostCard";
import { CreatePost } from "./CreatePost";
import { usePosts } from "@/hooks/usePosts";

export function Feed() {
  const { posts, isLoading, error, createPost, isCreating, refetch } = usePosts();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress size="lg" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          px: 3,
        }}
      >
        <Typography level="h4" sx={{ mb: 2 }}>
          Oops! Something went wrong
        </Typography>
        <Typography level="body-md" color="neutral" sx={{ mb: 3, textAlign: "center" }}>
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => refetch()}
          startDecorator={<RefreshIcon />}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 680,
        mx: "auto",
        px: { xs: 2, sm: 3 },
        py: 3,
      }}
    >
      <CreatePost
        onSubmit={async (content, file) => {
          await createPost({ content, file });
        }}
        isSubmitting={isCreating}
      />

      <Box sx={{ mt: 0.5 }}>
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 3,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: "action.hover",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              <AddIcon sx={{ fontSize: 40, color: "text.secondary" }} />
            </Box>
            <Typography level="h4" sx={{ mb: 1.5 }}>
              No posts yet
            </Typography>
            <Typography level="body-md" color="neutral" sx={{ maxWidth: 300, mx: "auto" }}>
              Be the first to share something with your community!
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Feed;
