import { Box, Typography, ListItem, ListItemContent, Chip, IconButton } from '@mui/joy';
import { formatDistanceToNow } from 'date-fns';
import { Delete as DeleteIcon, Done as DoneIcon } from '@mui/icons-material';
import { type Notification } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (_id: string) => void;
  onDelete: (_id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'connection':
        return 'primary';
      case 'like':
        return 'danger';
      case 'message':
        return 'success';
      case 'security':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <ListItem
      sx={{
        py: 2,
        px: 2,
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'background.level1',
        },
        opacity: notification.read ? 0.7 : 1,
        borderLeft: `3px solid`,
        borderLeftColor: getNotificationColor(notification.type),
        borderLeftWidth: notification.read ? '1px' : '3px',
      }}
      onClick={() => onMarkAsRead(notification.id)}
    >
      <ListItemContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography level="title-sm" fontWeight={notification.read ? 'normal' : 'bold'}>
            {notification.title}
          </Typography>
          {!notification.read && (
            <Chip size="sm" color="primary" variant="solid">
              New
            </Chip>
          )}
        </Box>
        <Typography level="body-sm" sx={{ mb: 1 }}>
          {notification.message}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {!notification.read && (
              <IconButton
                size="sm"
                variant="plain"
                color="success"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
              >
                <DoneIcon />
              </IconButton>
            )}
            <IconButton
              size="sm"
              variant="plain"
              color="neutral"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </ListItemContent>
    </ListItem>
  );
}