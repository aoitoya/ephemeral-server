import {
  Alert,
  Box,
  Card,
  CardContent,
  List,
  ListDivider,
  ListItem,
  Skeleton,
  Typography,
} from "@mui/joy";
import {
  useConnectionMutations,
  useConnectionsFetch,
} from "@/hooks/useConnection";
import type { Connection } from "@/services/api/connection.api";
import ConnectionRequestItem from "./ConnectionRequestItem";
import { useState } from "react";

export default function ConnectionRequests() {
  const { acceptConnectionRequest, rejectConnectionRequest } =
    useConnectionMutations();
  const {
    data: requests,
    isLoading,
    error,
    refetch,
  } = useConnectionsFetch({
    status: "pending",
  });

  const [actionLoading, setActionLoading] = useState<{
    accepting: string | null;
    rejecting: string | null;
  }>({ accepting: null, rejecting: null });

  const handleAccept = async (requestId: string) => {
    try {
      setActionLoading((prev) => ({ ...prev, accepting: requestId }));
      await acceptConnectionRequest({ requestId });
      refetch();
    } catch (error) {
      console.error("Error accepting connection request:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, accepting: null }));
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setActionLoading((prev) => ({ ...prev, rejecting: requestId }));
      await rejectConnectionRequest({ requestId });
      refetch();
    } catch (error) {
      console.error("Error rejecting connection request:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, rejecting: null }));
    }
  };

  if (isLoading) {
    return (
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography level="title-md" sx={{ mb: 2 }}>
            Connection Requests
          </Typography>
          <List>
            {[1, 2, 3].map((i) => (
              <ListItem key={i}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    py: 1,
                  }}
                >
                  <Skeleton
                    variant="circular"
                    width={48}
                    height={48}
                    sx={{ mr: 2 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Skeleton width="60%" height={24} sx={{ mb: 0.5 }} />
                    <Skeleton width="40%" height={16} />
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, ml: 2 }}>
                    <Skeleton
                      variant="rectangular"
                      width={80}
                      height={32}
                      sx={{ borderRadius: 1 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width={80}
                      height={32}
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Alert color="danger" sx={{ mb: 2 }}>
            Failed to load connection requests. Please try again.
          </Alert>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Typography
              level="body-sm"
              color="primary"
              sx={{
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
              onClick={() => refetch()}
            >
              Retry
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box textAlign="center" py={6}>
            <Typography level="body-lg" color="neutral" sx={{ mb: 1 }}>
              No pending connection requests
            </Typography>
            <Typography level="body-sm" color="neutral">
              When someone wants to connect with you, you&apos;ll see their request
              here
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <List>
          {requests.map((request: Connection, index: number) => (
            <div key={request.id}>
              <ConnectionRequestItem
                request={request}
                onAccept={handleAccept}
                onReject={handleReject}
                isAccepting={actionLoading.accepting === request.id}
                isRejecting={actionLoading.rejecting === request.id}
              />
              {index < requests.length - 1 && <ListDivider />}
            </div>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
