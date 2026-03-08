import {
  Avatar,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  Skeleton,
  Typography,
} from "@mui/joy";
import { useConnectionsFetch, type Connection } from "@/hooks/useConnection";
import ListItemContent from "@mui/joy/ListItemContent";

export default function ConnectionsList() {
  const { data: connections, isLoading } = useConnectionsFetch();

  if (isLoading) {
    return (
      <Card variant="outlined">
        <CardContent>
          <List>
            {[1, 2, 3].map((i) => (
              <ListItem key={i}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ ml: 2, flex: 1 }}>
                  <Skeleton width="60%" />
                  <Skeleton width="40%" level="body-sm" />
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  }

  if (!connections || connections.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography level="body-md" color="neutral">
          No connections yet. Connect with others to see them here.
        </Typography>
      </Box>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <List>
          {connections.map((connection: Connection) => (
            <ListItem key={connection.id}>
              <Avatar alt={connection.user.username} />
              <ListItemContent>
                <Typography level="title-sm">
                  {connection.user.username}
                </Typography>
              </ListItemContent>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
