import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  addNotification,
  markAllRead,
  markAsRead,
  clearNotifications,
} from "../store/slice/notificationSlice";
import type { Notification } from "../store/slice/notificationSlice";
import socket from "../utils/socket";
import type { RootState } from "../store/store";

const useAdminNotifications = () => {
  const dispatch = useAppDispatch();

  const notifications = useAppSelector(
    (state: RootState) => state.notifications.list,
  );
  
  const unreadCount = useAppSelector(
    (state) => state.notifications.unreadCount,
  );

  useEffect(() => {
    const handleConnect = () => {
      console.log("✅ SOCKET CONNECTED:", socket.id);
      socket.emit("join-admin");
    };

    const handleConnectError = (error: Error) => {
      console.error("❌ SOCKET CONNECTION ERROR:", error.message);
      console.error("❌ SOCKET ERROR:", error);
    };

    const handleDisconnect = (reason: string) => {
      console.warn("🔌 SOCKET DISCONNECTED:", reason);
    };
    const handleAdminNotification = (data: any) => {
      console.log("🔔 NEW NOTIFICATION RECEIVED:", data);

      const notification = data?.notification;
      if (!notification) {
        console.warn("⚠️ Notification data not found:", data);
        return;
      }
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 0.7;
      audio.play().catch((error) => {
        console.warn("Notification sound blocked:", error);
      });
      dispatch(
        addNotification({
          id: notification?._id || notification?.id || `${Date.now()}`,
          title: notification?.fullName
            ? `New Enquiry - ${notification.fullName}`
            : "New Enquiry",
          message: notification?.message || "You have a new notification",
          type: "info",
          timestamp: notification?.createdAt || new Date().toISOString(),
          data: notification,
        }),
      );
    };

    const handleNewMessage = (data: any) => {
      console.log("💬 NEW MESSAGE RECEIVED:", data);
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);
    socket.on("new_notification", handleAdminNotification);
    socket.on("new-message", handleNewMessage);

    if (socket.connected) {
      console.log("✅ SOCKET ALREADY CONNECTED:", socket.id);
      socket.emit("join-admin");
    } else {
      console.log("⏳ Connecting socket...");
      socket.connect();
    }

    return () => {
      console.log("🧹 Cleaning admin socket listeners");
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
      socket.off("new_notification", handleAdminNotification);
      socket.off("new-message", handleNewMessage);
    };
  }, [dispatch]);

  const addAdminNotification = useCallback(
    (notification: Notification) => {
      dispatch(addNotification(notification));
    },
    [dispatch],
  );

  const markNotificationAsRead = useCallback(
    (id: string) => {
      dispatch(markAsRead(id));
    },
    [dispatch],
  );

  const markAllNotificationsRead = useCallback(() => {
    dispatch(markAllRead());
  }, [dispatch]);

  const clearAllNotifications = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  return {
    notifications,
    unreadCount,
    addNotification: addAdminNotification,
    markAsRead: markNotificationAsRead,
    markAllRead: markAllNotificationsRead,
    clearNotifications: clearAllNotifications,
  };
};

export default useAdminNotifications;
