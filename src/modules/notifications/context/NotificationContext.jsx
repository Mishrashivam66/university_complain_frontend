import { createContext, useContext, useEffect, useState } from "react";

import toast from "react-hot-toast";

import socket from "../../../socket";

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../../../services/notificationService";

// ==========================================
// CONTEXT
// ==========================================

const NotificationContext = createContext();

// ==========================================
// PROVIDER
// ==========================================

export const NotificationProvider = ({ children }) => {
  // ==========================================
  // STATES
  // ==========================================

  const [notifications, setNotifications] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(false);

  // ==========================================
  // USER
  // ==========================================

  const user = JSON.parse(localStorage.getItem("user"));

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const { data } = await getNotifications();

      setNotifications(data.notifications || []);

      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.log(error);

      if (user?._id) {
        toast.error("Failed to load notifications");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH UNREAD COUNT
  // ==========================================

  const fetchUnreadCount = async () => {
    try {
      const { data } = await getUnreadCount();

      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================================
  // MARK AS READ
  // ==========================================

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? {
                ...notification,

                isRead: true,
              }
            : notification,
        ),
      );

      fetchUnreadCount();
    } catch (error) {
      console.log(error);

      toast.error("Failed to mark as read");
    }
  };

  // ==========================================
  // MARK ALL AS READ
  // ==========================================

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,

          isRead: true,
        })),
      );

      setUnreadCount(0);

      toast.success("All notifications marked as read");
    } catch (error) {
      console.log(error);

      toast.error("Failed to update notifications");
    }
  };

  // ==========================================
  // DELETE NOTIFICATION
  // ==========================================

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);

      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== id),
      );

      fetchUnreadCount();

      toast.success("Notification deleted");
    } catch (error) {
      console.log(error);

      toast.error("Failed to delete notification");
    }
  };

  // ==========================================
  // CLEAR ALL NOTIFICATIONS
  // ==========================================

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();

      setNotifications([]);

      setUnreadCount(0);

      toast.success("All notifications cleared");
    } catch (error) {
      console.log(error);

      toast.error("Failed to clear notifications");
    }
  };

  // ==========================================
  // SOCKET CONNECTION
  // ==========================================

  useEffect(() => {
    if (!user?._id) return;

    // ==========================================
    // JOIN ROOM
    // ==========================================

    socket.emit(
      "joinRoom",

      user._id,
    );

    // ==========================================
    // RECEIVE NEW NOTIFICATION
    // ==========================================

    socket.on(
      "newNotification",

      (notification) => {
        console.log("NEW NOTIFICATION:", notification);

        // ADD NEW NOTIFICATION

        setNotifications((prev) => [notification, ...prev]);

        // UPDATE COUNT

        setUnreadCount((prev) => prev + 1);

        // TOAST

        toast.success(notification.title || "New Notification");
      },
    );

    // ==========================================
    // UPDATE COUNT EVENT
    // ==========================================

    socket.on(
      "notificationCountUpdated",

      () => {
        fetchUnreadCount();
      },
    );

    // ==========================================
    // NOTIFICATION READ EVENT
    // ==========================================

    socket.on(
      "notificationRead",

      (notificationId) => {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification._id === notificationId
              ? {
                  ...notification,

                  isRead: true,
                }
              : notification,
          ),
        );
      },
    );

    // ==========================================
    // NOTIFICATION DELETE EVENT
    // ==========================================

    socket.on(
      "notificationDeleted",

      (notificationId) => {
        setNotifications((prev) =>
          prev.filter((notification) => notification._id !== notificationId),
        );
      },
    );

    // ==========================================
    // CLEANUP
    // ==========================================

    return () => {
      socket.off("newNotification");

      socket.off("notificationCountUpdated");

      socket.off("notificationRead");

      socket.off("notificationDeleted");
    };
  }, []);

  // ==========================================
  // INITIAL FETCH
  // ==========================================

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
    }
  }, []);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const value = {
    notifications,

    unreadCount,

    loading,

    fetchNotifications,

    fetchUnreadCount,

    handleMarkAsRead,

    handleMarkAllAsRead,

    handleDeleteNotification,

    handleClearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// ==========================================
// CUSTOM HOOK
// ==========================================

export const useNotifications = () => {
  return useContext(NotificationContext);
};
