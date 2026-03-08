import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';

export interface Notification {
  id: string;
  type: 'connection' | 'like' | 'message' | 'security' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    fromUser?: string;
    postId?: string;
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for new notifications
    const handleNewNotification = (notificationData: Omit<Notification, 'read' | 'id'>) => {
      const newNotification: Notification = {
        ...notificationData,
        id: Date.now().toString(), // Simple ID generation
        read: false,
        timestamp: new Date(notificationData.timestamp),
      };

      setNotifications(prev => [newNotification, ...prev]);
    };

    // Register socket event listeners
    socket.on('notification:new', handleNewNotification);
    socket.on('notification:connection_request', (data: { fromUsername: string }) => {
      handleNewNotification({
        type: 'connection',
        title: 'New Connection Request',
        message: `${data.fromUsername} wants to connect with you`,
        timestamp: new Date(),
        metadata: { fromUser: data.fromUsername },
      });
    });

    socket.on('notification:like', (data: { fromUsername: string; postId: string }) => {
      handleNewNotification({
        type: 'like',
        title: 'Your post is getting love',
        message: `${data.fromUsername} liked your post`,
        timestamp: new Date(),
        metadata: { fromUser: data.fromUsername, postId: data.postId },
      });
    });

    socket.on('notification:message', (data: { fromUsername: string; messagePreview: string }) => {
      handleNewNotification({
        type: 'message',
        title: 'New message',
        message: `${data.fromUsername}: ${data.messagePreview}`,
        timestamp: new Date(),
        actionUrl: `/messages/${data.fromUsername}`,
        metadata: { fromUser: data.fromUsername },
      });
    });

    socket.on('notification:security', (data: { message: string }) => {
      handleNewNotification({
        type: 'security',
        title: 'Security Alert',
        message: data.message,
        timestamp: new Date(),
      });
    });

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:connection_request');
      socket.off('notification:like');
      socket.off('notification:message');
      socket.off('notification:security');
    };
  }, [socket]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      timestamp: new Date(notification.timestamp),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  };
}