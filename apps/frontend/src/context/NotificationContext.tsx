'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  metadata?: any;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  connect: (token: string) => void;
  disconnect: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

let socket: Socket | null = null;
let apiToken: string | null = null; // Store token for HTTP requests

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const isMountedRef = useRef(true);
  const socketRef = useRef<Socket | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Track mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Cleanup on unmount
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      socket = null;
      apiToken = null;
    };
  }, []);

  // Safe state update helper
  const safeSetState = useCallback(<T,>(setter: (value: T | ((prev: T) => T)) => void, value: T | ((prev: T) => T)) => {
    if (isMountedRef.current) {
      try {
        setter(value);
      } catch (error) {
        // Silently ignore state update errors after unmount
        console.warn('State update after unmount ignored:', error);
      }
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!apiToken || !isMountedRef.current) return;
    try {
      const res = await fetch(`${apiUrl}/notifications`, {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
      });
      if (res.ok && isMountedRef.current) {
        const data = await res.json();
        safeSetState(setNotifications, data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [apiUrl, safeSetState]);

  const connect = useCallback((token: string) => {
    if (!isMountedRef.current) return;
    
    // Clean up existing socket if any
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }

    apiToken = token; // Store the token for HTTP requests

    const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
    const socketUrl = `${API_BASE}/notifications`;

    const newSocket = io(socketUrl, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socket = newSocket;
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      if (isMountedRef.current) {
        safeSetState(setIsConnected, true);
        fetchNotifications();
      }
    });

    newSocket.on('disconnect', () => {
      if (isMountedRef.current) {
        safeSetState(setIsConnected, false);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Notifications WebSocket connection error:', error);
    });

    newSocket.on('notification', (notification: Notification) => {
      if (isMountedRef.current) {
        safeSetState(setNotifications, (prev) => [notification, ...prev]);
      }
    });
  }, [fetchNotifications, safeSetState]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }
    apiToken = null;
    
    // Only update state if component is still mounted
    if (isMountedRef.current) {
      try {
        setIsConnected(false);
        setNotifications([]);
      } catch (error) {
        // Ignore errors if component is unmounting
        console.warn('State update during disconnect ignored:', error);
      }
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    if (!apiToken || !isMountedRef.current) return;
    // Optimistic update
    if (isMountedRef.current) {
      safeSetState(setNotifications, (prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    }
    try {
      await fetch(`${apiUrl}/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Consider reverting optimistic update on failure
    }
  }, [apiUrl, safeSetState]);

  const markAllAsRead = useCallback(async () => {
    if (!apiToken || !isMountedRef.current) return;
    // Optimistic update
    if (isMountedRef.current) {
      safeSetState(setNotifications, (prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
    try {
      await fetch(`${apiUrl}/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Consider reverting optimistic update on failure
    }
  }, [apiUrl, safeSetState]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        connect,
        disconnect,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
