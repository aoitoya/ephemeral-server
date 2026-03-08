import { useState, useRef, useEffect } from "react";
import {
  Box,
  Card,
  Textarea,
  Button,
  IconButton,
  Avatar,
  Sheet,
} from "@mui/joy";
import { Close, AddPhotoAlternate } from "@mui/icons-material";
import { useCurrentUser } from "@/hooks/useAuth";

interface CreatePostProps {
  onSubmit: (_content: string, _file?: File) => Promise<void>;
  isSubmitting: boolean;
}

export function CreatePost({ onSubmit, isSubmitting }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: currentUser } = useCurrentUser();

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;

    try {
      await onSubmit(content, selectedFile || undefined);
      setContent("");
      removeFile();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 3,
        overflow: "visible",
      }}
    >
      <Box sx={{ display: "flex", gap: 2 }}>
        <Avatar
          size="md"
          sx={{
            mt: 1.5,
            bgcolor: "primary.solidBg",
            fontSize: "1rem",
          }}
        >
          {currentUser?.username?.charAt(0).toUpperCase() || "U"}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <form onSubmit={handleSubmit}>
            <Textarea
              placeholder="What's on your mind?"
              minRows={2}
              maxRows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              sx={{
                border: "none",
                p: 0,
                minHeight: "60px",
                "&::before": {
                  display: "none",
                },
                "& .MuiInput-input": {
                  p: 0,
                },
              }}
              disabled={isSubmitting}
            />

            {previewUrl && (
              <Sheet
                sx={{
                  position: "relative",
                  mt: 2,
                  borderRadius: "lg",
                  overflow: "hidden",
                  display: "inline-block",
                  width: "100%",
                }}
              >
                <Box
                  component="img"
                  src={previewUrl}
                  alt="Preview"
                  sx={{
                    width: "100%",
                    maxHeight: "300px",
                    objectFit: "cover",
                    display: "block",
                    borderRadius: "lg",
                  }}
                />
                <IconButton
                  size="sm"
                  onClick={removeFile}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(4px)",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Sheet>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 2,
                pt: 2,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                sx={{
                  color: "text.secondary",
                  "&:hover": { bgcolor: "action.hover", color: "primary" },
                }}
              >
                <AddPhotoAlternate />
              </IconButton>
              <Button
                type="submit"
                disabled={(!content.trim() && !selectedFile) || isSubmitting}
                loading={isSubmitting}
                sx={{
                  borderRadius: "20px",
                  px: 3,
                }}
              >
                Post
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </Card>
  );
}

export default CreatePost;
